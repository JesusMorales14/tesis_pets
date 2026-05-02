import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _isDark = false;

  constructor() {
    const saved = localStorage.getItem('app-theme');
    if (saved !== null) {
      this._isDark = saved === 'dark';
    } else {
      this._isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.apply();
  }

  get isDark(): boolean {
    return this._isDark;
  }

  toggle(): void {
    this._isDark = !this._isDark;
    localStorage.setItem('app-theme', this._isDark ? 'dark' : 'light');
    this.apply();
  }

  private apply(): void {
    const html = document.documentElement;
    html.classList.toggle('ion-palette-dark', this._isDark);
    html.classList.toggle('dark', this._isDark);
  }
}
