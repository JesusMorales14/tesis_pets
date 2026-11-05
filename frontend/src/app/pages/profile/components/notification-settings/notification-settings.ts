import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DialogService } from '@core/services/dialog';
import { PushNotificationService } from '@core/services/push-notification';
import { CollapsibleSectionComponent } from '@shared/components/collapsible-section/collapsible-section';

const PRIMING = {
  admin:
    'Te avisaremos en este dispositivo apenas un cliente suba el comprobante de pago de una cita, para que puedas revisarlo sin tener que estar entrando a la app a cada rato.',
  user: 'Te avisaremos en este dispositivo 24 horas antes de tus citas, cuando se apruebe tu pago y cuando una vacuna de tu mascota esté por vencer.',
} as const;

/** Activar / desactivar / probar las notificaciones push en este dispositivo. */
@Component({
  selector: 'app-notification-settings',
  templateUrl: './notification-settings.html',
  styleUrls: ['./notification-settings.scss'],
  standalone: true,
  imports: [IonicModule, CollapsibleSectionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationSettingsComponent implements OnInit {
  private readonly push = inject(PushNotificationService);
  private readonly dialog = inject(DialogService);

  readonly isAdmin = input(false);

  protected readonly permission = signal(this.push.permission);
  /** Estado real de este dispositivo para la cuenta actual (null = consultando). */
  protected readonly subscribed = signal<boolean | null>(null);
  protected readonly isToggling = signal(false);
  protected readonly isSendingTest = signal(false);
  protected readonly info = signal('');
  protected readonly error = signal('');

  readonly supported = this.push.isSupported;

  ngOnInit(): void {
    void this.refresh();
  }

  /** Consulta el estado actual (al entrar a la página o cambiar de cuenta). */
  async refresh(): Promise<void> {
    this.permission.set(this.push.permission);
    if (!this.supported || this.permission() !== 'granted') {
      this.subscribed.set(false);
      return;
    }
    try {
      this.subscribed.set(await this.push.isSubscribed());
    } catch {
      this.subscribed.set(false);
    }
  }

  /** Antes de cerrar sesión: este dispositivo deja de recibir los avisos de la cuenta. */
  async detach(): Promise<void> {
    await this.push.detachFromAccount();
    this.subscribed.set(false);
    this.clearMessages();
  }

  // "Priming": se explica el motivo ANTES de pedir el permiso real. El
  // navegador recuerda un rechazo ("denied") para siempre, así que no se
  // gasta ese único intento si el usuario aún no está convencido.
  protected async enable(): Promise<void> {
    const message = `${this.isAdmin() ? PRIMING.admin : PRIMING.user} A continuación, tu navegador te pedirá confirmar el permiso.`;
    if (!(await this.dialog.confirm('Activar notificaciones', message))) return;

    await this.withToggle(async () => {
      const ok = await this.push.subscribe();
      if (ok) {
        this.subscribed.set(true);
        this.info.set('Notificaciones activadas en este dispositivo.');
      } else {
        this.error.set('Debes permitir las notificaciones en tu navegador para activarlas.');
      }
    }, 'No se pudo activar las notificaciones. Intenta de nuevo.');
    this.permission.set(this.push.permission);
  }

  protected async disable(): Promise<void> {
    await this.withToggle(async () => {
      await this.push.unsubscribe();
      this.subscribed.set(false);
      this.info.set('Notificaciones desactivadas. Ya no recibirás avisos en este dispositivo.');
    }, 'No se pudo desactivar las notificaciones. Intenta de nuevo.');
  }

  protected async sendTest(): Promise<void> {
    this.clearMessages();
    this.isSendingTest.set(true);
    try {
      await this.push.sendTest();
      this.info.set('Te enviamos una notificación de prueba. Debería aparecer en unos segundos.');
    } catch {
      this.error.set('No se pudo enviar la notificación de prueba.');
    } finally {
      this.isSendingTest.set(false);
    }
  }

  private async withToggle(action: () => Promise<void>, errorMessage: string): Promise<void> {
    this.clearMessages();
    this.isToggling.set(true);
    try {
      await action();
    } catch {
      this.error.set(errorMessage);
    } finally {
      this.isToggling.set(false);
    }
  }

  private clearMessages(): void {
    this.info.set('');
    this.error.set('');
  }
}
