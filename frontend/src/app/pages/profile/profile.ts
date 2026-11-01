import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth';
import { AppointmentService, Appointment } from '@core/services/appointment';
import { ThemeService } from '@core/services/theme';
import { PetService } from '@core/services/pet';
import { PetImageService } from '@core/services/pet-image';
import { PushNotificationService } from '@core/services/push-notification';
import { Pet, PetBody, DiagnosisHistoryEntry, Vaccination, VaccinationBody } from '@core/models/pet';
import { PetFormModalComponent } from '@pages/pet-selection/pet-form-modal/pet-form-modal';
import { VaccinationFormModalComponent } from '@pages/pet-selection/vaccination-form-modal/vaccination-form-modal';
import { ComprobanteModalComponent } from '@shared/components/comprobante-modal/comprobante-modal';
import { DiagnosisFlowService } from '@core/services/diagnosis-flow';
import { toLocalIsoDate } from '@core/utils/date';
import {
  VaccinationStatus,
  vaccinationStatus,
  vaccinationStatusLabel,
} from '@core/utils/vaccination-status';

export type UnifiedStatus = {
  label: string;
  color: string;
  icon: string;
};

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink, ComprobanteModalComponent],
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  private router = inject(Router);
  private appointmentService = inject(AppointmentService);
  private petService = inject(PetService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private pushService = inject(PushNotificationService);
  private flow = inject(DiagnosisFlowService);
  private destroyRef = inject(DestroyRef);
  themeService = inject(ThemeService);

  pushSupported = this.pushService.isSupported;
  pushPermission = this.pushService.permission;
  // Estado real de este dispositivo para la cuenta actual (null = consultando).
  pushSubscribed: boolean | null = null;
  isTogglingPush = false;
  isSendingTest = false;
  pushError = '';
  pushInfo = '';

  appointments: Appointment[] = [];
  isLoadingAppts = false;
  showAppointments = true;

  pets: Pet[] = [];
  isLoadingPets = false;
  showPets = true;
  expandedPetId: number | null = null;
  petHistories: Record<number, DiagnosisHistoryEntry[]> = {};
  loadingHistoryFor: number | null = null;

  vaccinations: Record<number, Vaccination[]> = {};
  loadingVaccinationsFor: number | null = null;

  petImages: Record<number, string> = {};

  private petImageService = inject(PetImageService);

  async loadPetImages(pets: Pet[]) {
    for (const pet of pets) {
      const url = await this.petImageService.imageFor(pet);
      this.petImages = { ...this.petImages, [pet.id]: url };
    }
  }

  // Icono para el botón de diagnóstico (pulso)
  pulseIcon = 'pulse';

  // Estado del modal de comprobante
  isComprobanteModalOpen = false;
  selectedAppointmentForComprobante: Appointment | null = null;

  /** Formatea el diagnóstico reemplazando guiones bajos por espacios */
  formatDiagnostico(diagnostico: string): string {
    return (diagnostico ?? '').replace(/_/g, ' ');
  }

  showPasswordForm = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  isChangingPassword = false;
  passwordError = '';
  passwordSuccess = '';

  isDeletingAccount = false;
  accountActionError = '';

  // Los datos dependen de quién tiene la sesión: al cerrarla se borra todo
  // lo cargado y al iniciarla (con la misma u otra cuenta) se pide de nuevo
  // al servidor, para no mostrar mascotas, vacunas o historiales viejos.
  ngOnInit() {
    this.auth.user$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      this.clearUserData();
      if (user) this.loadUserData();
    });
  }

  // Ionic reutiliza esta página desde su caché: al volver a ella se
  // recargan las citas (p. ej. el veterinario acaba de aprobar un pago) y
  // las mascotas (p. ej. se agregó una desde la pestaña Diagnóstico).
  private hasEntered = false;
  ionViewWillEnter() {
    if (this.hasEntered && this.auth.isLoggedIn) this.loadUserData();
    this.hasEntered = true;
  }

  private loadUserData() {
    this.loadMyAppointments();
    this.loadPets();
    this.refreshPushState();
  }

  private async refreshPushState() {
    this.pushPermission = this.pushService.permission;
    if (!this.pushSupported || this.pushPermission !== 'granted') {
      this.pushSubscribed = false;
      return;
    }
    try {
      this.pushSubscribed = await this.pushService.isSubscribed();
    } catch {
      this.pushSubscribed = false;
    }
  }

  private clearUserData() {
    this.appointments = [];
    this.pets = [];
    this.petImages = {};
    this.vaccinations = {};
    this.petHistories = {};
    this.expandedPetId = null;
  }

  loadMyAppointments() {
    this.isLoadingAppts = true;
    this.appointmentService.getMyAppointments().subscribe({
      next: (a) => { this.appointments = a; this.isLoadingAppts = false; },
      error: () => { this.isLoadingAppts = false; },
    });
  }

  toggleAppointments() {
    this.showAppointments = !this.showAppointments;
  }

  goToDiagnostico() {
    this.router.navigate(['/tabs/tab2']);
  }

  // "Priming": se explica el motivo ANTES de disparar el permiso real del
  // navegador. Si el usuario rechaza esta pantalla, no se gasta el único
  // intento real de pedir permiso — el navegador recuerda un rechazo
  // ("denied") de forma permanente y ya no se puede volver a preguntar.
  async enablePushNotifications() {
    const primingMessage = this.auth.isAdmin
      ? 'Te avisaremos en este dispositivo apenas un cliente suba el comprobante de pago de una cita, para que puedas revisarlo sin tener que estar entrando a la app a cada rato.'
      : 'Te avisaremos en este dispositivo 24 horas antes de tus citas, cuando se apruebe tu pago y cuando una vacuna de tu mascota esté por vencer.';

    const alert = await this.alertCtrl.create({
      header: 'Activar notificaciones',
      message: `${primingMessage} A continuación, tu navegador te pedirá confirmar el permiso.`,
      buttons: [
        { text: 'Ahora no', role: 'cancel' },
        { text: 'Continuar', handler: () => this.requestPushPermission() },
      ],
    });
    await alert.present();
  }

  private async requestPushPermission() {
    this.pushError = '';
    this.pushInfo = '';
    this.isTogglingPush = true;
    try {
      const ok = await this.pushService.subscribe();
      if (ok) {
        this.pushSubscribed = true;
        this.pushInfo = 'Notificaciones activadas en este dispositivo.';
      } else {
        this.pushError = 'Debes permitir las notificaciones en tu navegador para activarlas.';
      }
    } catch {
      this.pushError = 'No se pudo activar las notificaciones. Intenta de nuevo.';
    } finally {
      this.pushPermission = this.pushService.permission;
      this.isTogglingPush = false;
    }
  }

  async disablePushNotifications() {
    this.pushError = '';
    this.pushInfo = '';
    this.isTogglingPush = true;
    try {
      await this.pushService.unsubscribe();
      this.pushSubscribed = false;
      this.pushInfo = 'Notificaciones desactivadas. Ya no recibirás avisos en este dispositivo.';
    } catch {
      this.pushError = 'No se pudo desactivar las notificaciones. Intenta de nuevo.';
    } finally {
      this.isTogglingPush = false;
    }
  }

  async sendTestPush() {
    this.pushError = '';
    this.pushInfo = '';
    this.isSendingTest = true;
    try {
      await this.pushService.sendTest();
      this.pushInfo = 'Te enviamos una notificación de prueba. Debería aparecer en unos segundos.';
    } catch {
      this.pushError = 'No se pudo enviar la notificación de prueba.';
    } finally {
      this.isSendingTest = false;
    }
  }

  loadPets() {
    this.isLoadingPets = true;
    this.petService.getPets().subscribe({
      next: (p) => {
        this.pets = p;
        this.isLoadingPets = false;
        // Todo lo que va por id de mascota se rehace con las mascotas reales.
        const ids = new Set(p.map((pet) => pet.id));
        this.vaccinations = Object.fromEntries(
          Object.entries(this.vaccinations).filter(([id]) => ids.has(+id)),
        );
        this.petHistories = {};
        this.petImages = {};
        if (this.expandedPetId !== null && !ids.has(this.expandedPetId)) {
          this.expandedPetId = null;
        } else if (this.expandedPetId !== null) {
          this.loadHistory(this.expandedPetId);
        }
        // Se cargan de una vez (no solo al expandir) para poder mostrar el
        // aviso de vacuna vencida/próxima en la cabecera de cada mascota.
        p.forEach((pet) => this.loadVaccinations(pet.id));
        // Cargar imágenes de las mascotas (deterministas por raza)
        this.loadPetImages(p);
      },
      error: () => { this.isLoadingPets = false; },
    });
  }

  loadVaccinations(petId: number) {
    this.petService.getVaccinations(petId).subscribe({
      next: (v) => { this.vaccinations = { ...this.vaccinations, [petId]: v }; },
    });
  }

  readonly vaccinationStatus = vaccinationStatus;
  readonly vaccinationStatusLabel = vaccinationStatusLabel;

  // Peor estado entre todas las vacunas de la mascota, para la insignia en
  // la cabecera de la tarjeta (se ve sin necesidad de expandirla).
  petVaccinationBadge(pet: Pet): VaccinationStatus | null {
    const list = this.vaccinations[pet.id];
    if (!list || list.length === 0) return null;
    const statuses = list.map((v) => vaccinationStatus(v));
    if (statuses.includes('vencida')) return 'vencida';
    if (statuses.includes('proxima')) return 'proxima';
    return null;
  }

  async openAddVaccinationModal(pet: Pet) {
    const modal = await this.modalCtrl.create({
      component: VaccinationFormModalComponent,
      cssClass: 'pet-form-modal',
      componentProps: { especie: pet.especie },
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      this.petService.createVaccination(pet.id, data as VaccinationBody).subscribe({
        next: () => this.loadVaccinations(pet.id),
        error: (err) => this.showError(err?.error?.detail || 'No se pudo registrar la vacuna.'),
      });
    }
  }

  async deleteVaccination(pet: Pet, v: Vaccination) {
    const confirmed = await this.confirmDestructive(
      'Eliminar vacuna', `¿Eliminar el registro de "${v.nombre}" de ${pet.nombre}?`, 'Eliminar',
    );
    if (!confirmed) return;
    this.petService.deleteVaccination(pet.id, v.id).subscribe({
      next: () => this.loadVaccinations(pet.id),
      error: () => this.showError('No se pudo eliminar la vacuna.'),
    });
  }

  togglePets() {
    this.showPets = !this.showPets;
  }

  togglePetHistory(pet: Pet) {
    if (this.expandedPetId === pet.id) {
      this.expandedPetId = null;
      return;
    }
    this.expandedPetId = pet.id;
    // Siempre se pide de nuevo: puede haber diagnósticos nuevos desde la
    // última vez que se abrió.
    this.loadHistory(pet.id);
  }

  private loadHistory(petId: number) {
    this.loadingHistoryFor = petId;
    this.petService.getDiagnoses(petId).subscribe({
      next: (entries) => {
        this.petHistories = { ...this.petHistories, [petId]: entries };
        this.loadingHistoryFor = null;
      },
      error: () => { this.loadingHistoryFor = null; },
    });
  }

  onPetImageError(pet: Pet) {
    this.petImages = {
      ...this.petImages,
      [pet.id]: this.petImageService.fallbackFor(pet),
    };
  }

  private async showError(message: string) {
    const alert = await this.alertCtrl.create({ header: 'Algo salió mal', message, buttons: ['OK'] });
    await alert.present();
  }

  async openAddPetModal() {
    const modal = await this.modalCtrl.create({
      component: PetFormModalComponent,
      cssClass: 'pet-form-modal',
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      this.petService.createPet(data as PetBody).subscribe({
        next: () => this.loadPets(),
        error: (err) => this.showError(err?.error?.detail || 'No se pudo crear la mascota.'),
      });
    }
  }

  async openEditPetModal(pet: Pet) {
    const modal = await this.modalCtrl.create({
      component: PetFormModalComponent,
      cssClass: 'pet-form-modal',
      componentProps: { pet },
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      this.petService.updatePet(pet.id, data as PetBody).subscribe({
        next: () => this.loadPets(),
        error: (err) => this.showError(err?.error?.detail || 'No se pudo actualizar la mascota.'),
      });
    }
  }

  // Alerta nativa del navegador reemplazada por ion-alert: se ve integrada
  // con el tema de la app (claro/oscuro) en vez de romper la experiencia
  // con el popup gris genérico del sistema operativo.
  private async confirmDestructive(header: string, message: string, confirmText: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.alertCtrl.create({
        header,
        message,
        cssClass: 'destructive-alert',
        buttons: [
          { text: 'Cancelar', role: 'cancel', handler: () => resolve(false) },
          { text: confirmText, role: 'destructive', handler: () => resolve(true) },
        ],
      }).then((alert) => alert.present());
    });
  }

  async deletePet(pet: Pet) {
    const vaccineCount = this.vaccinations[pet.id]?.length ?? 0;
    let message = `¿Eliminar a ${pet.nombre} y todo su historial de diagnósticos y vacunas? Esta acción no se puede deshacer.`;
    if (vaccineCount > 0) message += ` Se eliminarán ${vaccineCount} vacuna(s) registrada(s).`;
    message += ' Sus citas ya reservadas no se cancelan.';

    const confirmed = await this.confirmDestructive('Eliminar mascota', message, 'Eliminar');
    if (!confirmed) return;

    this.petService.deletePet(pet.id).subscribe({
      next: () => {
        // Un diagnóstico en curso para esta mascota ya no puede asociarse a ella.
        if (this.flow.state?.petId === pet.id) this.flow.clear();
        // Se vuelve a pedir la lista al servidor en vez de solo quitarla en
        // memoria, para que lo que se ve sea exactamente lo que quedó guardado.
        this.loadPets();
      },
      error: () => this.showError(`No se pudo eliminar a ${pet.nombre}. Intenta de nuevo.`),
    });
  }

  /** Estado unificado de la cita (combina estado + pago) */
  getUnifiedStatus(a: Appointment): UnifiedStatus {
    // Si hay comprobante y pago pendiente -> el veterinario aún no lo revisa
    if (a.comprobante_url && a.pago_estado === 'pendiente' && a.estado !== 'cancelada') {
      return { label: 'Pago en verificación', color: '#d68910', icon: 'time-outline' };
    }
    // Si pago aprobado -> 'confirmada' (verde)
    if (a.pago_estado === 'aprobado') {
      return { label: 'Confirmada', color: '#27ae60', icon: 'checkmark-circle-outline' };
    }
    // Si pago rechazado -> 'cancelada' (rojo)
    if (a.pago_estado === 'rechazado') {
      return { label: 'Pago rechazado', color: '#c0392b', icon: 'close-circle-outline' };
    }
    // Estados base de la cita
    const baseMap: Record<string, UnifiedStatus> = {
      pendiente: { label: 'Pendiente', color: '#d68910', icon: 'time-outline' },
      confirmada: { label: 'Confirmada', color: '#27ae60', icon: 'checkmark-circle-outline' },
      cancelada: { label: 'Cancelada', color: '#c0392b', icon: 'close-circle-outline' },
    };
    return baseMap[a.estado] ?? { label: a.estado, color: '#888', icon: 'help-outline' };
  }

  /** Abre el modal para ver el comprobante (citas confirmadas o con comprobante) */
  viewComprobante(appointment: Appointment) {
    this.selectedAppointmentForComprobante = appointment;
    this.isComprobanteModalOpen = true;
  }

  /** Cierra el modal de comprobante */
  onComprobanteModalDismiss() {
    this.isComprobanteModalOpen = false;
    this.selectedAppointmentForComprobante = null;
  }

  /** Color para cada tarjeta de mascota (basado en índice) */
  getPetColor(index: number): string {
    const colors = ['#e3f2fd', '#f3e5f5', '#e8f5e9', '#fff3e0', '#fce4ec', '#e0f2f1'];
    return colors[index % colors.length];
  }

  formatFechaHora(isoDate: string): string {
    const d = new Date(isoDate);
    const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }

  togglePasswordForm() {
    this.showPasswordForm = !this.showPasswordForm;
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  submitPasswordChange() {
    this.passwordError = '';
    this.passwordSuccess = '';

    if (this.newPassword.length < 6) {
      this.passwordError = 'La nueva contraseña debe tener al menos 6 caracteres.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Las contraseñas no coinciden.';
      return;
    }

    this.isChangingPassword = true;
    this.auth.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.passwordSuccess = 'Contraseña actualizada correctamente.';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err) => {
        this.isChangingPassword = false;
        this.passwordError = err?.error?.detail || 'No se pudo actualizar la contraseña.';
      },
    });
  }

  goToLogin()    { this.router.navigate(['/login']); }
  goToRegister() { this.router.navigate(['/register']); }
  goToAdmin()    { this.router.navigate(['/admin']); }
  goBack()       { this.router.navigate(['/tabs/tab1']); }

  async logout() {
    // Antes de borrar el token: este dispositivo deja de recibir los avisos
    // de esta cuenta. clearUserData() se ejecuta solo, vía user$.
    await this.pushService.detachFromAccount();
    this.pushSubscribed = false;
    this.pushInfo = '';
    this.pushError = '';
    this.auth.logout();
  }

  goToMyDataExport() {
    this.router.navigate(['/mis-datos']);
  }

  async deleteAccount() {
    const confirmed = await this.confirmDestructive(
      'Eliminar cuenta',
      'Esto elimina tu cuenta, tus mascotas, su historial de diagnósticos y vacunas, y tus citas. ' +
      'No se puede deshacer. ¿Quieres continuar?',
      'Eliminar cuenta',
    );
    if (!confirmed) return;

    this.isDeletingAccount = true;
    this.accountActionError = '';
    this.auth.deleteMyAccount().subscribe({
      next: () => {
        this.isDeletingAccount = false;
        this.auth.logout();
        this.router.navigate(['/tabs/tab1']);
      },
      error: () => {
        this.isDeletingAccount = false;
        this.accountActionError = 'No se pudo eliminar tu cuenta. Intenta de nuevo.';
      },
    });
  }

  getEstadoColor(estado: string): string {
    const map: Record<string, string> = { pendiente: '#d68910', confirmada: '#27ae60', cancelada: '#c0392b' };
    return map[estado] ?? '#888';
  }

  isTomorrow(fecha: string): boolean {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return fecha === toLocalIsoDate(tomorrow);
  }

  formatFecha(fecha: string): string {
    const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const d = new Date(fecha + 'T00:00:00');
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }

  /** Limpia la caché de imágenes de razas (útil para forzar recarga) */
  clearBreedImageCache() {
    this.petImageService.clearCache();
    this.petImages = {};
    this.loadPetImages(this.pets);
  }
}
