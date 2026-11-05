import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { SeoData, SeoService } from './seo.service';

const BRAND = 'CityVet';

/**
 * Título del documento por ruta ("Mi cuenta | CityVet") y metaetiquetas
 * tomadas de `data.seo`. Además del SEO, el título cambia en cada
 * navegación: así los lectores de pantalla anuncian la página nueva en una
 * SPA (WCAG 2.4.2 "Página titulada").
 */
@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly seo = inject(SeoService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot);
    const fullTitle = pageTitle ? `${pageTitle} | ${BRAND}` : `${BRAND} · Diagnóstico veterinario con IA`;
    this.title.setTitle(fullTitle);
    this.seo.update(fullTitle, this.deepestSeoData(snapshot.root));
  }

  private deepestSeoData(route: ActivatedRouteSnapshot): SeoData {
    let data: SeoData = {};
    for (let r: ActivatedRouteSnapshot | null = route; r; r = r.firstChild) {
      data = { ...data, ...(r.data['seo'] as SeoData | undefined) };
    }
    return data;
  }
}
