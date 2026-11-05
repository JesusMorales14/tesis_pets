import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  PreloadAllModules,
  RouteReuseStrategy,
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
} from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { routes } from './app.routes';
import { AppTitleStrategy } from './core/seo/app-title.strategy';
import { authInterceptor } from './core/interceptors/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    // Agrupa los eventos de un mismo ciclo en una sola detección de cambios.
    provideZoneChangeDetection({ eventCoalescing: true }),
    importProvidersFrom(IonicModule.forRoot()),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    // PreloadAllModules: tras la carga inicial, descarga en segundo plano el
    // resto de las páginas para que la navegación sea instantánea.
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideAnimations(),
  ],
};
