import { Injectable, computed, signal, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { BP_QUERIES } from '@core/constants/breakpoints';

@Injectable({ providedIn: 'root' })
export class BreakpointService {
  private bo = inject(BreakpointObserver);

  private readonly _isDesktop = signal(false);
  private readonly _isHandset = signal(true);

  readonly isDesktop = this._isDesktop.asReadonly();
  readonly isHandset = this._isHandset.asReadonly();
  readonly isTablet = computed(() => !this._isDesktop() && !this._isHandset());

  constructor() {
    this.bo.observe([BP_QUERIES.desktop]).subscribe((r) => {
      this._isDesktop.set(r.matches);
      this.applyClass();
    });
    this.bo.observe([BP_QUERIES.handset]).subscribe((r) => {
      this._isHandset.set(r.matches);
      this.applyClass();
    });
  }

  private applyClass(): void {
    const html = document.documentElement;
    html.classList.toggle('is-desktop', this._isDesktop());
    html.classList.toggle('is-handset', this._isHandset());
  }
}
