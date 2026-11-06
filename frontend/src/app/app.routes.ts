import { Routes } from '@angular/router';
import { adminGuard, authGuard } from '@core/guards/auth';
import { AppShellComponent } from '@layout/app-shell/app-shell';

/** Pantallas privadas: requieren sesión y no deben indexarse. */
const PRIVATE = { seo: { noIndex: true } };

/**
 * Todas las páginas se cargan bajo demanda (lazy loading) con
 * `loadComponent`; el título de cada ruta lo completa AppTitleStrategy.
 */
export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: 'tabs',
        loadComponent: () => import('@layout/tabs/tabs').then((m) => m.TabsPage),
        children: [
          {
            path: 'tab1',
            title: 'Inicio',
            loadComponent: () => import('@layout/tab1/tab1').then((m) => m.Tab1Page),
          },
          {
            path: 'tab2',
            title: 'Diagnóstico por síntomas',
            data: {
              seo: {
                description:
                  'Elige a tu perro o gato, marca sus síntomas y obtén un pre-diagnóstico con inteligencia artificial en segundos.',
              },
            },
            loadComponent: () => import('@layout/tab2/tab2').then((m) => m.Tab2Page),
          },
          {
            path: 'tab3',
            title: 'Guía de salud',
            data: {
              seo: {
                description:
                  'Enfermedades comunes de perros y gatos, primeros auxilios y cuidados preventivos explicados por veterinarios.',
              },
            },
            loadComponent: () => import('@layout/tab3/tab3').then((m) => m.Tab3Page),
          },
          { path: '', redirectTo: '/tabs/tab1', pathMatch: 'full' },
        ],
      },
      { path: '', redirectTo: '/tabs/tab1', pathMatch: 'full' },
      {
        path: 'symptoms-selection/:especie',
        title: 'Síntomas',
        loadComponent: () =>
          import('./pages/symptoms-selection/symptoms-selection').then((m) => m.SymptomsSelectionComponent),
      },
      {
        path: 'diagnostic-result',
        title: 'Resultado del diagnóstico',
        data: PRIVATE,
        loadComponent: () =>
          import('./pages/diagnostic-result/diagnostic-result').then((m) => m.DiagnosticResultComponent),
      },
      {
        path: 'schedule',
        title: 'Reservar cita',
        data: PRIVATE,
        loadComponent: () => import('./pages/schedule/schedule').then((m) => m.ScheduleComponent),
      },
      {
        path: 'payment',
        title: 'Pago de la cita',
        data: PRIVATE,
        loadComponent: () => import('./pages/payment/payment').then((m) => m.PaymentComponent),
        canActivate: [authGuard],
      },
      {
        path: 'admin',
        title: 'Panel de administración',
        data: PRIVATE,
        loadComponent: () => import('./pages/admin/admin').then((m) => m.AdminComponent),
        canActivate: [adminGuard],
      },
      {
        path: 'profile',
        title: 'Mi cuenta',
        data: PRIVATE,
        loadComponent: () => import('./pages/profile/profile').then((m) => m.ProfileComponent),
      },
    ],
  },
  {
    path: 'login',
    title: 'Iniciar sesión',
    data: PRIVATE,
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    title: 'Crear cuenta',
    data: PRIVATE,
    loadComponent: () => import('./pages/register/register').then((m) => m.RegisterComponent),
  },
  {
    path: 'privacy-policy',
    title: 'Política de privacidad',
    loadComponent: () => import('./pages/privacy-policy/privacy-policy').then((m) => m.PrivacyPolicyComponent),
  },
  {
    path: 'mis-datos',
    title: 'Mis datos',
    data: PRIVATE,
    loadComponent: () => import('./pages/my-data-export/my-data-export').then((m) => m.MyDataExportComponent),
    canActivate: [authGuard],
  },
  // Cualquier URL desconocida vuelve al inicio en lugar de quedar en blanco.
  { path: '**', redirectTo: '/tabs/tab1' },
];
