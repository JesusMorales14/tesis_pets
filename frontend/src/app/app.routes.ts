import { Routes } from '@angular/router';
import { adminGuard } from '@core/guards/auth';
import { AppShellComponent } from '@layout/app-shell/app-shell';

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
            loadComponent: () => import('@layout/tab1/tab1').then((m) => m.Tab1Page),
          },
          {
            path: 'tab2',
            loadComponent: () => import('@layout/tab2/tab2').then((m) => m.Tab2Page),
          },
          {
            path: 'tab3',
            loadComponent: () => import('@layout/tab3/tab3').then((m) => m.Tab3Page),
          },
          { path: '', redirectTo: '/tabs/tab1', pathMatch: 'full' },
        ],
      },
      { path: '', redirectTo: '/tabs/tab1', pathMatch: 'full' },
      {
        path: 'symptoms-selection/:especie',
        loadComponent: () =>
          import('./pages/symptoms-selection/symptoms-selection').then(
            (m) => m.SymptomsSelectionComponent,
          ),
      },
      {
        path: 'diagnostic-result',
        loadComponent: () =>
          import('./pages/diagnostic-result/diagnostic-result').then(
            (m) => m.DiagnosticResultComponent,
          ),
      },
      {
        path: 'schedule',
        loadComponent: () =>
          import('./pages/schedule/schedule').then((m) => m.ScheduleComponent),
      },
      {
        path: 'payment',
        loadComponent: () =>
          import('./pages/payment/payment').then((m) => m.PaymentComponent),
      },
      {
        path: 'admin',
        loadComponent: () =>
          import('./pages/admin/admin').then((m) => m.AdminComponent),
        canActivate: [adminGuard],
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile').then((m) => m.ProfileComponent),
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then((m) => m.RegisterComponent),
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./pages/privacy-policy/privacy-policy').then((m) => m.PrivacyPolicyComponent),
  },
  {
    path: 'mis-datos',
    loadComponent: () =>
      import('./pages/my-data-export/my-data-export').then((m) => m.MyDataExportComponent),
  },
];
