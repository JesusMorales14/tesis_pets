import { Injectable, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';

/**
 * Diálogos de confirmación y error con `ion-alert`: se integran con el tema
 * de la app (claro/oscuro) y son accesibles (foco atrapado, rol dialog), a
 * diferencia de `window.confirm()`.
 */
@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly alertCtrl = inject(AlertController);

  /** Pide confirmación para una acción irreversible. Resuelve `true` si se acepta. */
  async confirmDestructive(header: string, message: string, confirmText = 'Eliminar'): Promise<boolean> {
    const alert = await this.alertCtrl.create({
      header,
      message,
      cssClass: 'destructive-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: confirmText, role: 'destructive' },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'destructive';
  }

  /** Explica algo antes de continuar. Resuelve `true` si se elige continuar. */
  async confirm(header: string, message: string, confirmText = 'Continuar', cancelText = 'Ahora no'): Promise<boolean> {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: [
        { text: cancelText, role: 'cancel' },
        { text: confirmText, role: 'confirm' },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }

  async error(message: string, header = 'Algo salió mal'): Promise<void> {
    const alert = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }
}
