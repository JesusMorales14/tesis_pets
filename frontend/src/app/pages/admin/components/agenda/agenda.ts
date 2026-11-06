import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Appointment, AppointmentEstado } from '@core/models/appointment';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state';
import { PaginationComponent } from '@shared/components/pagination/pagination';
import { AppDatePipe } from '@shared/pipes';
import { AgendaOrder, EspecieFilter, countByEspecie, organizeAgenda, paginate } from '../../agenda.utils';
import { AgendaCardComponent } from '../agenda-card/agenda-card';

const PAGE_SIZE = 4;

/**
 * Citas del día (HU17): filtro por especie, orden por gravedad u hora y
 * paginación. Las acciones se delegan al contenedor mediante eventos.
 */
@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.html',
  styleUrls: ['./agenda.scss'],
  standalone: true,
  imports: [IonicModule, AppDatePipe, EmptyStateComponent, PaginationComponent, AgendaCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgendaComponent {
  readonly appointments = input<Appointment[]>([]);
  readonly loading = input(false);
  readonly date = input<string | null>(null);

  readonly openClinicalRecord = output<Appointment>();
  readonly reviewPayment = output<Appointment>();
  readonly viewComprobante = output<Appointment>();
  readonly changeEstado = output<{ appointment: Appointment; estado: AppointmentEstado }>();

  protected readonly pageSize = PAGE_SIZE;
  protected readonly especie = signal<EspecieFilter>('todas');
  protected readonly order = signal<AgendaOrder>('gravedad');
  protected readonly page = signal(1);

  protected readonly especieOptions: { value: EspecieFilter; label: string }[] = [
    { value: 'todas', label: 'Todas' },
    { value: 'perro', label: 'Perros' },
    { value: 'gato', label: 'Gatos' },
  ];

  protected readonly visible = computed(() => organizeAgenda(this.appointments(), this.especie(), this.order()));
  protected readonly paged = computed(() => paginate(this.visible(), this.page(), PAGE_SIZE));

  constructor() {
    // Una agenda nueva (otro día o recarga) vuelve a la primera página.
    effect(() => {
      this.appointments();
      this.page.set(1);
    });
  }

  protected count(especie: EspecieFilter): number {
    return countByEspecie(this.appointments(), especie);
  }

  protected setEspecie(especie: EspecieFilter): void {
    this.especie.set(especie);
    this.page.set(1);
  }

  protected setOrder(order: AgendaOrder): void {
    this.order.set(order);
    this.page.set(1);
  }
}
