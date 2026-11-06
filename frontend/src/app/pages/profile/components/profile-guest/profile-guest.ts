import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';

/** Invitación a iniciar sesión o registrarse (usuario sin sesión). */
@Component({
  selector: 'app-profile-guest',
  templateUrl: './profile-guest.html',
  styleUrls: ['./profile-guest.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileGuestComponent {}
