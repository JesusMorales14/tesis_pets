import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';

/** Mensajes breves de resultado con `ion-toast` (anunciados por lectores de pantalla). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastCtrl = inject(ToastController);

  async success(message: string): Promise<void> {
    await this.show(message, 'success');
  }

  async error(message: string): Promise<void> {
    await this.show(message, 'danger');
  }

  private async show(message: string, color: 'success' | 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration: 2500,
      position: 'bottom',
      buttons: [{ text: 'OK', role: 'cancel' }],
    });
    await toast.present();
  }
}
