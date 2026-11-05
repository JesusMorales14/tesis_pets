import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { User } from '@core/models/user';

/** Avatar, nombre y rol del usuario; acceso al panel si es administrador. */
@Component({
  selector: 'app-user-summary',
  templateUrl: './user-summary.html',
  styleUrls: ['./user-summary.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSummaryComponent {
  readonly user = input.required<User>();
  readonly isAdmin = input(false);

  protected readonly initial = computed(() => this.user().nombre.charAt(0).toUpperCase());
}
