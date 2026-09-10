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
    path: 'citas',
    loadComponent: () =>
      import('./features/appointments/appointments.component').then(m => m.AppointmentsComponent),
    canActivate: [authGuard, roleGuard(['gerente', 'administradora'])],
  },
  {
    path: 'clientes',
    loadComponent: () =>
      import('./features/clients/clients.component').then(m => m.ClientsComponent),
    canActivate: [authGuard, roleGuard(['gerente', 'administradora'])],
  },
  {
    path: 'auditoria',
    loadComponent: () =>
      import('./features/audit/audit.component').then(m => m.AuditComponent),
    canActivate: [authGuard, roleGuard(['gerente', 'administradora'])],
  },
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then(m => m.LandingComponent),
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
