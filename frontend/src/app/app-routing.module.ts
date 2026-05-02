import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { adminGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./tabs/tabs.module').then((m) => m.TabsPageModule),
  },
  {
    path: 'symptoms-selection/:especie',
    loadComponent: () =>
      import('./pages/symptoms-selection/symptoms-selection.component').then(
        (m) => m.SymptomsSelectionComponent,
      ),
  },
  {
    path: 'diagnostic-result',
    loadComponent: () =>
      import('./pages/diagnostic-result/diagnostic-result.component').then(
        (m) => m.DiagnosticResultComponent,
      ),
  },
  {
    path: 'schedule',
    loadComponent: () =>
      import('./pages/schedule/schedule.component').then(
        (m) => m.ScheduleComponent,
      ),
  },
  {
    path: 'payment',
    loadComponent: () =>
      import('./pages/payment/payment.component').then(
        (m) => m.PaymentComponent,
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin.component').then(
        (m) => m.AdminComponent,
      ),
    canActivate: [adminGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent,
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
