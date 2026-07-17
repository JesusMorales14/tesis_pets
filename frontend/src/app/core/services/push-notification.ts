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

  /** Pide permiso al usuario y, si lo concede, registra la suscripción en el backend. */
  async subscribe(): Promise<boolean> {
    if (!this.isSupported) return false;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const { publicKey } = await firstValueFrom(
      this.http.get<{ publicKey: string }>(`${this.API}/push/vapid-public-key`),
    );

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(publicKey),
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

  async unsubscribe(): Promise<void> {
    if (!this.isSupported) return;
    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    const subscription = await registration?.pushManager.getSubscription();
    if (!subscription) return;

    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();
    await firstValueFrom(
      this.http.post(`${this.API}/push/unsubscribe`, { endpoint }),
    );
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
