import { ChangeDetectionStrategy, Component, OnInit, computed, inject, output, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Appointment } from '@core/models/appointment';
import { AppointmentService } from '@core/services/appointment';
import { getApiErrorMessage } from '@core/utils/http-error';
import { ComprobanteModalComponent } from '@shared/components/comprobante-modal/comprobante-modal';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state';
import { AdminNotice } from '../../admin-notice';
import { PendingPaymentCardComponent } from '../pending-payment-card/pending-payment-card';

/**
 * Comprobantes de pago pendientes de revisión (independiente del día de la
 * agenda: un comprobante puede llegar para una cita de cualquier fecha).
 *
 * Incluye un carrusel y la "revisión en cola": al aprobar o rechazar, el
 * modal pasa solo al siguiente comprobante.
 */
@Component({
  selector: 'app-pending-payments',
  templateUrl: './pending-payments.html',
  styleUrls: ['./pending-payments.scss'],
  standalone: true,
  imports: [IonicModule, EmptyStateComponent, PendingPaymentCardComponent, ComprobanteModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendingPaymentsComponent implements OnInit {
  private readonly appointmentApi = inject(AppointmentService);

  /** Se aprobó o rechazó un pago: la agenda del día puede haber cambiado. */
  readonly decided = output<void>();
  readonly notify = output<AdminNotice>();

  protected readonly payments = signal<Appointment[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly carouselIndex = signal(0);

  protected readonly selected = signal<Appointment | null>(null);
  protected readonly decidingId = signal<number | null>(null);

  private readonly queue = signal<{ total: number; done: number } | null>(null);
  protected readonly queueLabel = computed(() => {
    const q = this.queue();
    return q ? `Comprobante ${q.done + 1} de ${q.total}` : null;
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.appointmentApi.getPendingPayments().subscribe({
      // El backend los ordena por fecha y hora: primero las citas más próximas.
      next: (list) => {
        this.payments.set(list);
        this.clampCarousel();
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  /** Abre el comprobante de una cita (también desde la agenda). */
  open(appointment: Appointment): void {
    this.selected.set(appointment);
  }

  // ── Carrusel ───────────────────────────────────────────────────────────
  protected onCarouselScroll(track: HTMLElement): void {
    const step = this.cardStep(track);
    if (step) this.carouselIndex.set(Math.min(this.payments().length - 1, Math.round(track.scrollLeft / step)));
  }

  protected scrollCarousel(track: HTMLElement, direction: 1 | -1): void {
    const step = this.cardStep(track);
    if (step) track.scrollBy({ left: direction * step, behavior: 'smooth' });
  }

  // ── Revisión en cola ───────────────────────────────────────────────────
  protected startQueue(): void {
    const list = this.payments();
    if (list.length === 0) return;
    this.queue.set({ total: list.length, done: 0 });
    this.open(list[0]);
  }

  /** Se llama al cerrar el modal (backdrop, ESC, deslizar o botón cerrar). */
  protected onModalDismiss(): void {
    this.selected.set(null);
    this.queue.set(null);
  }

  protected readonly approve = (): void => this.decide(true);
  protected readonly reject = (): void => this.decide(false);

  private decide(aprobado: boolean): void {
    const appt = this.selected();
    if (!appt) return;
    this.decidingId.set(appt.id);
    this.appointmentApi.decidePayment(appt.id, aprobado).subscribe({
      next: () => {
        this.decidingId.set(null);
        this.payments.update((list) => list.filter((p) => p.id !== appt.id));
        this.clampCarousel();
        this.notify.emit({
          message: aprobado ? 'Pago aprobado, cita confirmada' : 'Pago rechazado, horario liberado',
          isError: !aprobado,
        });
        this.advanceQueue();
        // Rechazar libera el horario: la agenda del día también cambia.
        this.decided.emit();
      },
      error: (err) => {
        this.decidingId.set(null);
        this.onModalDismiss();
        this.notify.emit({ message: getApiErrorMessage(err, 'Error al procesar el pago'), isError: true });
        this.load();
      },
    });
  }

  private advanceQueue(): void {
    const q = this.queue();
    const remaining = this.payments();
    if (q && remaining.length > 0) {
      // Siguiente de la cola en el mismo modal, sin cerrarlo.
      this.queue.set({ ...q, done: q.done + 1 });
      this.selected.set(remaining[0]);
      return;
    }
    if (q) this.notify.emit({ message: 'Revisaste todos los comprobantes pendientes' });
    this.onModalDismiss();
  }

  private clampCarousel(): void {
    this.carouselIndex.update((i) => Math.min(i, Math.max(0, this.payments().length - 1)));
  }

  private cardStep(track: HTMLElement): number {
    const card = track.querySelector<HTMLElement>('.payment-review-card');
    if (!card) return 0;
    return card.offsetWidth + parseFloat(getComputedStyle(track).columnGap || '0');
  }
}
