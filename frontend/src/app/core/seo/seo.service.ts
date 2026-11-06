import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';

export const DEFAULT_DESCRIPTION =
  'CityVet: identifica posibles enfermedades de tu perro o gato a partir de sus síntomas con inteligencia artificial, ' +
  'reserva una cita veterinaria en Chincha Alta y lleva su historial de vacunas.';

export interface SeoData {
  description?: string;
  /** Pantallas privadas (cuenta, pago, panel): no deben indexarse. */
  noIndex?: boolean;
}

/** Metaetiquetas por página: descripción, Open Graph, robots y URL canónica. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  update(title: string, data: SeoData = {}): void {
    const description = data.description ?? DEFAULT_DESCRIPTION;
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ name: 'robots', content: data.noIndex ? 'noindex, nofollow' : 'index, follow' });
    this.updateCanonical();
  }

  private updateCanonical(): void {
    const link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) return;
    const { origin, pathname } = this.document.location;
    link.href = `${origin}${pathname}`;
  }
}
