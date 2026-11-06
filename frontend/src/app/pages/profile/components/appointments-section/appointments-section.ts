import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Appointment } from '@core/models/appointment';
import { CollapsibleSectionComponent } from '@shared/components/collapsible-section/collapsible-section';
import { ComprobanteModalComponent } from '@shared/components/comprobante-modal/comprobante-modal';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state';
import { ProfileStore } from '../../profile.store';
import { AppointmentItemComponent } from '../appointment-item/appointment-item';

/** "Mis citas": lista de citas del usuario y visor del comprobante. */
@Component({
  selector: 'app-appointments-section',
  templateUrl: './appointments-section.html',
  styleUrls: ['./appointments-section.scss'],
  standalone: true,
  imports: [
    IonicModule,
    RouterLink,
    CollapsibleSectionComponent,
    EmptyStateComponent,
    AppointmentItemComponent,
    ComprobanteModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentsSectionComponent {
  protected readonly store = inject(ProfileStore);

  readonly expanded = model(true);
  protected readonly selected = signal<Appointment | null>(null);

  protected openComprobante(appointment: Appointment): void {
    this.selected.set(appointment);
  }

  protected closeComprobante(): void {
    this.selected.set(null);
  }
}
