import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '@core/services/auth';
import { PageToolbarComponent } from '@shared/components/page-toolbar/page-toolbar';
import { AppointmentsSectionComponent } from './components/appointments-section/appointments-section';
import { NotificationSettingsComponent } from './components/notification-settings/notification-settings';
import { PasswordFormComponent } from './components/password-form/password-form';
import { PetsSectionComponent } from './components/pets-section/pets-section';
import { PrivacySectionComponent } from './components/privacy-section/privacy-section';
import { ProfileGuestComponent } from './components/profile-guest/profile-guest';
import { UserSummaryComponent } from './components/user-summary/user-summary';
import { ProfileStore } from './profile.store';

/**
 * "Mi cuenta" (contenedor). Orquesta la sesión y el ciclo de vida de la
 * página; cada sección es un subcomponente y los datos viven en
 * {@link ProfileStore}.
 */
@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
  standalone: true,
  imports: [
    IonicModule,
    PageToolbarComponent,
    ProfileGuestComponent,
    UserSummaryComponent,
    AppointmentsSectionComponent,
    NotificationSettingsComponent,
    PetsSectionComponent,
    PasswordFormComponent,
    PrivacySectionComponent,
  ],
  providers: [ProfileStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly store = inject(ProfileStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly user = toSignal(this.auth.user$, { initialValue: this.auth.currentUser });
  private readonly notifications = viewChild(NotificationSettingsComponent);
  private hasEntered = false;

  // Los datos dependen de quién tiene la sesión: al cerrarla se borra todo
  // y al iniciarla (con la misma u otra cuenta) se pide de nuevo al servidor.
  ngOnInit(): void {
    this.auth.user$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      this.store.reset();
      if (user) this.loadUserData();
    });
  }

  // Ionic reutiliza esta página desde su caché: al volver se recargan las
  // citas (p. ej. el veterinario aprobó un pago) y las mascotas.
  ionViewWillEnter(): void {
    if (this.hasEntered && this.auth.isLoggedIn) this.loadUserData();
    this.hasEntered = true;
  }

  protected async logout(): Promise<void> {
    // Antes de borrar el token: este dispositivo deja de recibir los avisos
    // de esta cuenta. El store se limpia solo, vía user$.
    await this.notifications()?.detach();
    this.auth.logout();
  }

  protected onAccountDeleted(): void {
    this.auth.logout();
    void this.router.navigate(['/tabs/tab1']);
  }

  private loadUserData(): void {
    this.store.loadAll();
    // Al crearse, la sección de notificaciones consulta su estado sola; al
    // volver a la página (ya creada) se le pide que lo actualice.
    void this.notifications()?.refresh();
  }
}
