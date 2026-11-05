import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys';

const THEME_COLORS = { light: '#f4f5f8', dark: '#0f0f16' } as const;

/**
 * Tema claro/oscuro. Respeta la preferencia del sistema operativo hasta
 * que el usuario elige uno, y desde entonces recuerda su elección.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly _isDark = signal(this.initialPreference());

  /** Señal de solo lectura, para templates con OnPush o `computed()`. */
  readonly dark = this._isDark.asReadonly();

  constructor() {
    this.apply();
  }

  get isDark(): boolean {
    return this._isDark();
  }

  toggle(): void {
    this._isDark.update((v) => !v);
    try {
      localStorage.setItem(STORAGE_KEYS.theme, this._isDark() ? 'dark' : 'light');
    } catch {
      /* storage no disponible (modo privado) */
    }
    this.apply();
  }

  private initialPreference(): boolean {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.theme);
      if (saved !== null) return saved === 'dark';
    } catch {
      /* storage no disponible */
    }
    return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  }

  private apply(): void {
    const html = this.document.documentElement;
    const dark = this._isDark();
    html.classList.toggle('ion-palette-dark', dark);
    html.classList.toggle('dark', dark);
    // Color de la barra del navegador / sistema en móviles (PWA).
    this.document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', dark ? THEME_COLORS.dark : THEME_COLORS.light);
  }
}
