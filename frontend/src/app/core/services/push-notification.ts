import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private http = inject(HttpClient);
  private readonly API = environment.apiUrl;

  get isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  get permission(): NotificationPermission | 'unsupported' {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }

  /**
   * Si ESTE dispositivo recibe las notificaciones de la cuenta actual. No
   * basta con el permiso del navegador: sigue "concedido" después de
   * desactivarlas (una web no puede revocarlo) y el mismo navegador pudo
   * quedar suscrito con otra cuenta.
   */
  async isSubscribed(): Promise<boolean> {
    const subscription = await this.currentSubscription();
    if (!subscription) return false;
    const { subscribed } = await firstValueFrom(
      this.http.post<{ subscribed: boolean }>(`${this.API}/push/status`, { endpoint: subscription.endpoint }),
    );
    if (!subscribed) return false;

    // Si el servidor cambió su clave VAPID, esta suscripción ya no recibe
    // nada aunque siga registrada: se renueva sola (el permiso ya está
    // concedido, así que el navegador no vuelve a preguntar).
    if (!this.sameKey(subscription, await this.serverKey())) {
      return this.subscribe();
    }
    return true;
  }

  /** Pide permiso al usuario y, si lo concede, registra la suscripción en el backend. */
  async subscribe(): Promise<boolean> {
    if (!this.isSupported) return false;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const serverKey = await this.serverKey();

    let subscription = await registration.pushManager.getSubscription();
    // Una suscripción creada con otra clave VAPID (p. ej. el backend la
    // regeneró al reiniciarse) ya no recibe nada: se reemplaza.
    if (subscription && !this.sameKey(subscription, serverKey)) {
      await subscription.unsubscribe();
      subscription = null;
    }
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: serverKey,
      });
    }

    const json = subscription.toJSON();
    await firstValueFrom(
      this.http.post(
        `${this.API}/push/subscribe`,
        { endpoint: json.endpoint, p256dh: json.keys?.['p256dh'], auth: json.keys?.['auth'] },
      ),
    );
    return true;
  }

  /** Desactiva las notificaciones en este dispositivo (navegador y backend). */
  async unsubscribe(): Promise<void> {
    const subscription = await this.currentSubscription();
    if (!subscription) return;

    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();
    await firstValueFrom(this.http.post(`${this.API}/push/unsubscribe`, { endpoint }));
  }

  /**
   * Al cerrar sesión: este dispositivo deja de recibir las notificaciones de
   * la cuenta (si no, quien entre después en el mismo navegador vería los
   * avisos de las mascotas y citas de otra persona). Debe llamarse ANTES de
   * borrar el token, porque el backend necesita saber de qué cuenta es.
   */
  async detachFromAccount(): Promise<void> {
    try {
      const subscription = await this.currentSubscription();
      if (!subscription) return;
      await firstValueFrom(
        this.http.post(`${this.API}/push/unsubscribe`, { endpoint: subscription.endpoint }),
      );
    } catch {
      // Cerrar sesión no debe fallar por esto.
    }
  }

  /** Envía una notificación de ejemplo a este dispositivo. */
  async sendTest(): Promise<void> {
    const subscription = await this.currentSubscription();
    if (!subscription) throw new Error('Sin suscripción');
    await firstValueFrom(this.http.post(`${this.API}/push/test`, { endpoint: subscription.endpoint }));
  }

  private async currentSubscription(): Promise<PushSubscription | null> {
    if (!this.isSupported) return null;
    const registration = await navigator.serviceWorker.getRegistration();
    return (await registration?.pushManager.getSubscription()) ?? null;
  }

  private async serverKey(): Promise<Uint8Array<ArrayBuffer>> {
    const { publicKey } = await firstValueFrom(
      this.http.get<{ publicKey: string }>(`${this.API}/push/vapid-public-key`),
    );
    return this.urlBase64ToUint8Array(publicKey);
  }

  private sameKey(subscription: PushSubscription, serverKey: Uint8Array): boolean {
    const current = subscription.options?.applicationServerKey;
    if (!current) return false;
    const bytes = new Uint8Array(current);
    return bytes.length === serverKey.length && bytes.every((b, i) => b === serverKey[i]);
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const output = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
      output[i] = rawData.charCodeAt(i);
    }
    return output;
  }
}
