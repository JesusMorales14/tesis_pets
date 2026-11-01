import { Component, effect, inject, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, Platform } from '@ionic/angular';
import { Appointment } from '@core/services/appointment';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-comprobante-modal',
  templateUrl: './comprobante-modal.html',
  styleUrls: ['./comprobante-modal.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class ComprobanteModalComponent implements OnInit {
  private platform = inject(Platform);

  /** Datos de la cita para mostrar en el modal */
  appointment = input.required<Appointment>();
  /** Si es true, muestra botones de acción (para admin). Si false, solo visualización (para usuario). */
  showActions = input(false);
  /** Callback cuando se aprueba el pago (solo admin) */
  onApprove = input<(() => void | Promise<void>) | null>(null);
  /** Callback cuando se rechaza el pago (solo admin) */
  onReject = input<(() => void | Promise<void>) | null>(null);
  /** Texto del botón de aprobar */
  approveText = input('Aprobar');
  /** Texto del botón de rechazar */
  rejectText = input('Rechazar');
  /** Si está procesando una acción */
  isProcessing = input(false);
  /** Progreso de la revisión en cola (p. ej. "Comprobante 2 de 12"). */
  progressLabel = input<string | null>(null);

  constructor() {
    // En la revisión en cola el mismo modal pasa a otra cita: la imagen
    // anterior no debe quedar ampliada ni marcada con error.
    effect(() => {
      this.appointment();
      this.isFullscreen = false;
      this.imageError = false;
    });
  }

  /** Evento emitido cuando se debe cerrar el modal (desde botón de header) */
  closeModalEvent = output<void>();

  readonly apiUrl = environment.apiUrl;
  isMobile = false;

  // Estado para fullscreen de imagen
  isFullscreen = false;

  ngOnInit() {
    this.isMobile = this.platform.is('mobile') || this.platform.is('tablet');
  }

  /** Cerrar modal desde botón del header */
  closeModal() {
    this.closeModalEvent.emit();
  }

  async handleApprove() {
    if (this.onApprove()) {
      await this.onApprove()!();
    }
  }

  async handleReject() {
    if (this.onReject()) {
      await this.onReject()!();
    }
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
  }

  /** Maneja error al cargar la imagen del comprobante */
  imageError = false;

  onImageError() {
    this.imageError = true;
  }

  getImageUrl(): string {
    const url = this.appointment().comprobante_url;
    return url ? `${this.apiUrl}${url}` : '';
  }

  getPaymentMethodLabel(): string {
    return this.appointment().metodo_pago === 'yape'
      ? 'Yape'
      : 'Transferencia bancaria';
  }

  getSeverityLabel(): string {
    return (
      this.appointment().gravedad?.charAt(0).toUpperCase() +
      this.appointment().gravedad?.slice(1)
    );
  }

  getPaymentStatusIcon(): string {
    const estado = this.appointment().pago_estado;
    const map: Record<string, string> = {
      pendiente: 'time-outline',
      aprobado: 'checkmark-circle-outline',
      rechazado: 'close-circle-outline',
    };
    return map[estado] ?? 'help-outline';
  }

  getPaymentStatusLabel(): string {
    const estado = this.appointment().pago_estado;
    const map: Record<string, string> = {
      pendiente: 'Pago pendiente',
      aprobado: 'Pagado',
      rechazado: 'Pago rechazado',
    };
    return map[estado] ?? estado;
  }

  /** Formatea el diagnóstico reemplazando guiones bajos por espacios */
  formatDiagnostico(diagnostico: string): string {
    return (diagnostico ?? '').replace(/_/g, ' ');
  }
}
