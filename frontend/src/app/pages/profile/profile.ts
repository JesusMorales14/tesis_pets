import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth';
import { AppointmentService, Appointment } from '@core/services/appointment';
import { ThemeService } from '@core/services/theme';
import { PetService } from '@core/services/pet';
import { PushNotificationService } from '@core/services/push-notification';
import { Pet, PetBody, DiagnosisHistoryEntry, Vaccination, VaccinationBody } from '@core/models/pet';
import { PetFormModalComponent } from '@pages/pet-selection/pet-form-modal/pet-form-modal';
import { VaccinationFormModalComponent } from '@pages/pet-selection/vaccination-form-modal/vaccination-form-modal';

export type VaccinationStatus = 'vencida' | 'proxima' | 'al-dia' | 'sin-fecha';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink],
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  private router = inject(Router);
  private appointmentService = inject(AppointmentService);
  private petService = inject(PetService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private pushService = inject(PushNotificationService);
  themeService = inject(ThemeService);

  pushSupported = this.pushService.isSupported;
  pushPermission = this.pushService.permission;
  isTogglingPush = false;
  pushError = '';

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

  showPasswordForm = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  isChangingPassword = false;
  passwordError = '';
  passwordSuccess = '';

  isDeletingAccount = false;
  accountActionError = '';

  ngOnInit() {
    if (this.auth.isLoggedIn) {
      this.loadMyAppointments();
      this.loadPets();
    }
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
      : 'Te avisaremos en este dispositivo un día antes de tus citas agendadas, para que no se te olviden.';

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
    this.isTogglingPush = true;
    try {
      const ok = await this.pushService.subscribe();
      if (!ok) {
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
    this.isTogglingPush = true;
    try {
      await this.pushService.unsubscribe();
    } finally {
      this.isTogglingPush = false;
    }
  }

  loadPets() {
    this.isLoadingPets = true;
    this.petService.getPets().subscribe({
      next: (p) => {
        this.pets = p;
        this.isLoadingPets = false;
        // Se cargan de una vez (no solo al expandir) para poder mostrar el
        // aviso de vacuna vencida/próxima en la cabecera de cada mascota.
        p.forEach((pet) => this.loadVaccinations(pet.id));
      },
      error: () => { this.isLoadingPets = false; },
    });
  }

  loadVaccinations(petId: number) {
    this.petService.getVaccinations(petId).subscribe({
      next: (v) => { this.vaccinations = { ...this.vaccinations, [petId]: v }; },
    });
  }

  vaccinationStatus(v: Vaccination): VaccinationStatus {
    if (!v.fecha_proxima) return 'sin-fecha';
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(v.fecha_proxima + 'T00:00:00');
    const daysLeft = (due.getTime() - today.getTime()) / 86400000;
    if (daysLeft < 0) return 'vencida';
    if (daysLeft <= 30) return 'proxima';
    return 'al-dia';
  }

  vaccinationStatusLabel(status: VaccinationStatus): string {
    return { vencida: 'Vencida', proxima: 'Próxima', 'al-dia': 'Al día', 'sin-fecha': 'Sin recordatorio' }[status];
  }

  // Peor estado entre todas las vacunas de la mascota, para la insignia en
  // la cabecera de la tarjeta (se ve sin necesidad de expandirla).
  petVaccinationBadge(pet: Pet): VaccinationStatus | null {
    const list = this.vaccinations[pet.id];
    if (!list || list.length === 0) return null;
    const statuses = list.map((v) => this.vaccinationStatus(v));
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
      });
    }
  }

  deleteVaccination(pet: Pet, v: Vaccination) {
    this.petService.deleteVaccination(pet.id, v.id).subscribe({
      next: () => this.loadVaccinations(pet.id),
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
    if (!this.petHistories[pet.id]) {
      this.loadingHistoryFor = pet.id;
      this.petService.getDiagnoses(pet.id).subscribe({
        next: (entries) => {
          this.petHistories = { ...this.petHistories, [pet.id]: entries };
          this.loadingHistoryFor = null;
        },
        error: () => { this.loadingHistoryFor = null; },
      });
    }
  }

  async openAddPetModal() {
    const modal = await this.modalCtrl.create({
      component: PetFormModalComponent,
      cssClass: 'pet-form-modal',
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      this.petService.createPet(data as PetBody).subscribe({ next: () => this.loadPets() });
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
      this.petService.updatePet(pet.id, data as PetBody).subscribe({ next: () => this.loadPets() });
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
    const confirmed = await this.confirmDestructive(
      'Eliminar mascota',
      `¿Eliminar a ${pet.nombre} y todo su historial de diagnósticos? Esta acción no se puede deshacer.`,
      'Eliminar',
    );
    if (!confirmed) return;

    this.petService.deletePet(pet.id).subscribe({
      next: () => {
        this.pets = this.pets.filter((p) => p.id !== pet.id);
        delete this.petHistories[pet.id];
        delete this.vaccinations[pet.id];
      },
    });
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

  logout() {
    this.auth.logout();
    this.appointments = [];
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
    return fecha === tomorrow.toISOString().split('T')[0];
  }

  formatFecha(fecha: string): string {
    const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const d = new Date(fecha + 'T00:00:00');
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
}
