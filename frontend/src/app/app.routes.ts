import { Routes } from '@angular/router';
import { authGuard } from './core/guards/role.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'pacientes',
    loadComponent: () =>
      import('./features/patients/patients.component').then(m => m.PatientsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'pacientes/:id',
    loadComponent: () =>
      import('./features/patient-detail/patient-detail.component').then(m => m.PatientDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'gastos',
    loadComponent: () =>
      import('./features/expenses/expenses.component').then(m => m.ExpensesComponent),
    canActivate: [authGuard, roleGuard(['gerente', 'administradora'])],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
