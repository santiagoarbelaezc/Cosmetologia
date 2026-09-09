import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { AuthService } from '../../core/services/auth.service';
import { PermissionsService } from '../../core/services/permissions.service';
import { CurrencyCopPipe } from '../../shared/pipes/currency-cop.pipe';
import { Patient, Treatment } from '../../core/models/patient.model';
import { ROLE_LABELS } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyCopPipe],
  template: `
    <div class="animate-fade-in space-y-7 w-full">

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- TOP BANNER: Personalized Role Greeting                   -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <section class="card p-6 sm:p-7 bg-white border border-zinc-200/90 shadow-sm rounded-2xl">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div class="flex flex-wrap items-center gap-2 mb-1.5">
              <span class="micro-label">{{ greeting() }}</span>
              <span class="text-zinc-300">·</span>
              <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 uppercase tracking-wider">
                {{ roleBadgeLabel() }}
              </span>
              <span class="text-zinc-300">·</span>
              <span class="text-xs text-zinc-400 font-medium">{{ currentDateFormatted() }}</span>
            </div>

            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              {{ authService.currentUser()?.name }}
            </h1>
            <p class="text-sm text-zinc-500 mt-1 max-w-2xl">
              {{ roleHeadline() }}
            </p>
          </div>

          <!-- Quick Navigation Actions -->
          <div class="flex flex-wrap items-center gap-3">
            <button
              (click)="navigateTo('/pacientes')"
              class="btn-primary text-xs sm:text-sm px-5 py-2.5 shadow-sm"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              Ver Pacientes & Workflow
            </button>

            @if (permissions.canViewExpenses()) {
              <button
                (click)="navigateTo('/gastos')"
                class="btn-secondary text-xs sm:text-sm px-4 py-2.5"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Gestión de Gastos
              </button>
            }
          </div>
        </div>
      </section>

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- VISTA 1: DASHBOARD GERENCIAL (Carolina · Gerente)         -->
      <!-- ═════════════════════════════════════════════════════════ -->
      @if (authService.currentRole() === 'gerente') {
        
        <!-- Financial & Executive KPIs -->
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="card p-5 bg-white border border-zinc-200/90">
            <div class="flex items-center justify-between mb-2">
              <span class="micro-label">Facturación Bruta</span>
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <p class="text-2xl font-bold tracking-tight text-zinc-900">
              {{ dataService.financialSummary().totalCollected | currencyCop }}
            </p>
            <p class="text-xs text-zinc-400 mt-1">Ingresos recaudados del periodo</p>
          </div>

          <div class="card p-5 bg-white border border-zinc-200/90">
            <div class="flex items-center justify-between mb-2">
              <span class="micro-label">Egresos Operativos</span>
              <span class="w-2 h-2 rounded-full bg-rose-500"></span>
            </div>
            <p class="text-2xl font-bold tracking-tight text-rose-600">
              {{ dataService.financialSummary().totalExpenses | currencyCop }}
            </p>
            <p class="text-xs text-zinc-400 mt-1">Insumos, nómina y servicios</p>
          </div>

          <div class="card p-5 bg-zinc-900 text-white border border-zinc-800">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Utilidad Neta</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    [ngClass]="dataService.financialSummary().netBalance >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'">
                {{ profitMarginPercentage() }}% margen
              </span>
            </div>
            <p class="text-2xl font-bold tracking-tight text-white">
              {{ dataService.financialSummary().netBalance | currencyCop }}
            </p>
            <p class="text-xs text-zinc-400 mt-1">Beneficio operativo neto</p>
          </div>

          <div class="card p-5 bg-white border border-zinc-200/90">
            <div class="flex items-center justify-between mb-2">
              <span class="micro-label">Cuentas por Cobrar</span>
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            </div>
            <p class="text-2xl font-bold tracking-tight text-zinc-900">
              {{ totalPendingReceivables() | currencyCop }}
            </p>
            <p class="text-xs text-zinc-400 mt-1">Saldos pendientes en cartera</p>
          </div>
        </section>

        <!-- Operational Breakdown by Specialty -->
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Medicina Estética Performance -->
          <div class="card p-6 bg-white border border-zinc-200/90 space-y-4">
            <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 class="text-base font-bold text-zinc-900">Procedimientos Médicos No Invasivos</h3>
                <p class="text-xs text-zinc-400">Responsable: Dr. Andrés Castaño</p>
              </div>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700">
                {{ medicalTreatmentsCount() }} activos
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="p-3 bg-zinc-50 rounded-xl">
                <span class="micro-label">Facturado en Área</span>
                <p class="text-lg font-bold text-zinc-900 mt-1">{{ medicalRevenue() | currencyCop }}</p>
              </div>
              <div class="p-3 bg-zinc-50 rounded-xl">
                <span class="micro-label">Pacientes Asignados</span>
                <p class="text-lg font-bold text-zinc-900 mt-1">{{ medicalPatientsCount() }} pacientes</p>
              </div>
            </div>

            <p class="text-xs text-zinc-500">
              Tratamientos principales: Toxina Botulínica, Ácido Hialurónico, PRP y Rinomodelación.
            </p>
          </div>

          <!-- Cosmetología Corporal Performance -->
          <div class="card p-6 bg-white border border-zinc-200/90 space-y-4">
            <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 class="text-base font-bold text-zinc-900">Servicios Corporales & Cosmetología</h3>
                <p class="text-xs text-zinc-400">Responsable: Camila Herrera</p>
              </div>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700">
                {{ cosmeticTreatmentsCount() }} activos
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="p-3 bg-zinc-50 rounded-xl">
                <span class="micro-label">Facturado en Área</span>
                <p class="text-lg font-bold text-zinc-900 mt-1">{{ cosmeticRevenue() | currencyCop }}</p>
              </div>
              <div class="p-3 bg-zinc-50 rounded-xl">
                <span class="micro-label">Pacientes en Cabina</span>
                <p class="text-lg font-bold text-zinc-900 mt-1">{{ cosmeticPatientsCount() }} pacientes</p>
              </div>
            </div>

            <p class="text-xs text-zinc-500">
              Tratamientos principales: Hidrolipoclasia, Radiofrecuencia, Peeling químico y Carboxiterapia.
            </p>
          </div>
        </section>

      }

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- VISTA 2: DASHBOARD ADMINISTRADORA (Valentina · Admin)     -->
      <!-- ═════════════════════════════════════════════════════════ -->
      @if (authService.currentRole() === 'administradora') {
        
        <!-- Daily Administration & Cash KPIs -->
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="card p-5 bg-white border border-zinc-200/90">
            <span class="micro-label">Total Recaudado</span>
            <p class="text-2xl font-bold tracking-tight text-emerald-600 mt-1">
              {{ dataService.financialSummary().totalCollected | currencyCop }}
            </p>
            <p class="text-xs text-zinc-400 mt-1">Ingresos registrados en caja</p>
          </div>

          <div class="card p-5 bg-white border border-zinc-200/90">
            <span class="micro-label">Cartera por Cobrar</span>
            <p class="text-2xl font-bold tracking-tight text-rose-600 mt-1">
              {{ totalPendingReceivables() | currencyCop }}
            </p>
            <p class="text-xs text-zinc-400 mt-1">Saldos pendientes de cobro</p>
          </div>

          <div class="card p-5 bg-white border border-zinc-200/90">
            <span class="micro-label">Pacientes en Seguimiento</span>
            <p class="text-2xl font-bold tracking-tight text-zinc-900 mt-1">
              {{ dataService.patients().length }}
            </p>
            <p class="text-xs text-zinc-400 mt-1">Expedientes activos registrados</p>
          </div>

          <div class="card p-5 bg-white border border-zinc-200/90">
            <span class="micro-label">Pacientes con Saldo</span>
            <p class="text-2xl font-bold tracking-tight text-amber-600 mt-1">
              {{ patientsWithPendingBalanceCount() }}
            </p>
            <p class="text-xs text-zinc-400 mt-1">Requieren gestión de cobro</p>
          </div>
        </section>

        <!-- Patients Needing Attention / Payment Follow-up -->
        <section class="card p-6 bg-white border border-zinc-200/90 space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 class="text-base font-bold text-zinc-900">Control de Caja & Cartera Pendiente</h3>
              <p class="text-xs text-zinc-400">Pacientes con tratamientos activos y saldos pendientes por abonar</p>
            </div>
            <button (click)="navigateTo('/pacientes')" class="btn-ghost text-xs cursor-pointer">
              Ver todos los pacientes →
            </button>
          </div>

          <div class="space-y-2.5">
            @for (p of pendingPatientsList(); track p.id) {
              <div class="p-3.5 bg-zinc-50 border border-zinc-200/70 rounded-xl flex items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-zinc-200 text-zinc-700 font-bold text-xs flex items-center justify-center">
                    {{ p.firstName.charAt(0) }}{{ p.lastName.charAt(0) }}
                  </div>
                  <div>
                    <h4 class="text-sm font-bold text-zinc-900">{{ p.firstName }} {{ p.lastName }}</h4>
                    <p class="text-xs text-zinc-500">CC {{ p.documentId }} · Tel: {{ p.phone }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-4 text-right">
                  <div>
                    <p class="text-[10px] uppercase font-semibold text-zinc-400">Saldo Pendiente</p>
                    <p class="text-sm font-bold text-rose-600">{{ getPatientBalance(p) | currencyCop }}</p>
                  </div>
                  <button (click)="openPatient(p.id)" class="btn-secondary text-xs px-3 py-1.5">
                    Registrar Abono
                  </button>
                </div>
              </div>
            }
          </div>
        </section>

      }

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- VISTA 3: DASHBOARD MÉDICO (Dr. Andrés Castaño · Medico)   -->
      <!-- ═════════════════════════════════════════════════════════ -->
      @if (authService.currentRole() === 'medico') {
        
        <!-- Medical Clinical KPIs -->
        <section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="card p-5 bg-white border border-zinc-200/90">
            <span class="micro-label">Mis Pacientes Médicos</span>
            <p class="text-3xl font-bold tracking-tight text-zinc-900 mt-2">
              {{ assignedDoctorPatients().length }}
            </p>
            <p class="text-xs text-zinc-400 mt-1">Pacientes bajo tratamiento médico</p>
          </div>

          <div class="card p-5 bg-white border border-zinc-200/90">
            <span class="micro-label">Procedimientos en Curso</span>
            <p class="text-3xl font-bold tracking-tight text-zinc-900 mt-2">
              {{ activeDoctorTreatmentsCount() }}
            </p>
            <p class="text-xs text-zinc-400 mt-1">No invasivos (Toxina, Relleno, PRP)</p>
          </div>

          <div class="card p-5 bg-white border border-zinc-200/90">
            <span class="micro-label">Evoluciones Realizadas</span>
            <p class="text-3xl font-bold tracking-tight text-zinc-900 mt-2">
              {{ completedDoctorSessionsCount() }}
            </p>
            <p class="text-xs text-zinc-400 mt-1">Sesiones clínicas registradas</p>
          </div>
        </section>

        <!-- Doctor's Assigned Patients Directory -->
        <section class="card p-6 bg-white border border-zinc-200/90 space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 class="text-base font-bold text-zinc-900">Mis Pacientes y Procedimientos Médicos</h3>
              <p class="text-xs text-zinc-400">Seguimiento de evolución y control post-aplicación</p>
            </div>
            <button (click)="navigateTo('/pacientes')" class="btn-ghost text-xs cursor-pointer">
              Abrir Módulo de Pacientes & Flujo →
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (p of assignedDoctorPatients(); track p.id) {
              <div class="p-4 bg-zinc-50 border border-zinc-200/70 rounded-xl space-y-3">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                      {{ p.firstName.charAt(0) }}{{ p.lastName.charAt(0) }}
                    </div>
                    <div>
                      <h4 class="text-sm font-bold text-zinc-900">{{ p.firstName }} {{ p.lastName }}</h4>
                      <p class="text-xs text-zinc-500">CC {{ p.documentId }} · Desde: {{ p.createdAt }}</p>
                    </div>
                  </div>
                  <button (click)="openPatient(p.id)" class="btn-secondary text-xs px-3 py-1.5">
                    Ficha Clínica
                  </button>
                </div>

                <div class="pt-2 border-t border-zinc-200/60">
                  <p class="text-[10px] uppercase font-semibold text-zinc-400">Procedimiento Activo</p>
                  <p class="text-xs font-semibold text-zinc-800 mt-0.5">{{ getPatientActiveMedicalTreatment(p) }}</p>
                </div>
              </div>
            }
          </div>
        </section>

      }

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- VISTA 4: DASHBOARD COSMETÓLOGA (Camila Herrera)          -->
      <!-- ═════════════════════════════════════════════════════════ -->
      @if (authService.currentRole() === 'cosmetologa') {
        
        <!-- Cosmetologist Clinical KPIs -->
        <section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="card p-5 bg-white border border-zinc-200/90">
            <span class="micro-label">Mis Pacientes en Cabina</span>
            <p class="text-3xl font-bold tracking-tight text-zinc-900 mt-2">
              {{ assignedCosmetologistPatients().length }}
            </p>
            <p class="text-xs text-zinc-400 mt-1">Pacientes en sesiones corporales y faciales</p>
          </div>

          <div class="card p-5 bg-white border border-zinc-200/90">
            <span class="micro-label">Protocolos Activos</span>
            <p class="text-3xl font-bold tracking-tight text-zinc-900 mt-2">
              {{ activeCosmeticTreatmentsCount() }}
            </p>
            <p class="text-xs text-zinc-400 mt-1">Hidrolipoclasia, RF, Peeling, etc.</p>
          </div>

          <div class="card p-5 bg-white border border-zinc-200/90">
            <span class="micro-label">Sesiones de Cabina Realizadas</span>
            <p class="text-3xl font-bold tracking-tight text-zinc-900 mt-2">
              {{ completedCosmeticSessionsCount() }}
            </p>
            <p class="text-xs text-zinc-400 mt-1">Evoluciones registradas con éxito</p>
          </div>
        </section>

        <!-- Cosmetology Assigned Patients Directory -->
        <section class="card p-6 bg-white border border-zinc-200/90 space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 class="text-base font-bold text-zinc-900">Mis Pacientes de Cabina & Protocolos</h3>
              <p class="text-xs text-zinc-400">Seguimiento de sesiones, aparatología y reducción de medidas</p>
            </div>
            <button (click)="navigateTo('/pacientes')" class="btn-ghost text-xs cursor-pointer">
              Abrir Módulo de Pacientes & Flujo →
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (p of assignedCosmetologistPatients(); track p.id) {
              <div class="p-4 bg-zinc-50 border border-zinc-200/70 rounded-xl space-y-3">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-zinc-800 text-white font-bold text-xs flex items-center justify-center">
                      {{ p.firstName.charAt(0) }}{{ p.lastName.charAt(0) }}
                    </div>
                    <div>
                      <h4 class="text-sm font-bold text-zinc-900">{{ p.firstName }} {{ p.lastName }}</h4>
                      <p class="text-xs text-zinc-500">CC {{ p.documentId }}</p>
                    </div>
                  </div>
                  <button (click)="openPatient(p.id)" class="btn-secondary text-xs px-3 py-1.5">
                    Ficha & Evolución
                  </button>
                </div>

                <div class="pt-2 border-t border-zinc-200/60">
                  <p class="text-[10px] uppercase font-semibold text-zinc-400">Tratamiento & Avance</p>
                  <p class="text-xs font-semibold text-zinc-800 mt-0.5">{{ getPatientActiveCosmeticTreatment(p) }}</p>
                </div>
              </div>
            }
          </div>
        </section>

      }

    </div>
  `,
})
export class DashboardComponent {
  readonly dataService = inject(MockDataService);
  readonly authService = inject(AuthService);
  readonly permissions = inject(PermissionsService);
  private readonly router = inject(Router);

  // ─── Helpers for Gerente ──────────────────────────────────
  readonly profitMarginPercentage = computed(() => {
    const collected = this.dataService.financialSummary().totalCollected;
    const net = this.dataService.financialSummary().netBalance;
    if (collected <= 0) return 0;
    return Math.round((net / collected) * 100);
  });

  readonly totalPendingReceivables = computed(() => {
    return this.dataService.patients().reduce((sum, p) => sum + this.getPatientBalance(p), 0);
  });

  readonly medicalPatientsCount = computed(() => {
    return this.dataService.patients().filter(p => p.assignedSpecialistId === 'usr-003').length;
  });

  readonly cosmeticPatientsCount = computed(() => {
    return this.dataService.patients().filter(p => p.assignedSpecialistId === 'usr-004').length;
  });

  readonly medicalTreatmentsCount = computed(() => {
    return this.dataService.patients().reduce((count, p) =>
      count + p.treatments.filter(t => t.category === 'medico-no-invasivo' && t.status === 'active').length, 0
    );
  });

  readonly cosmeticTreatmentsCount = computed(() => {
    return this.dataService.patients().reduce((count, p) =>
      count + p.treatments.filter(t => t.category === 'corporal-cosmetologia' && t.status === 'active').length, 0
    );
  });

  readonly medicalRevenue = computed(() => {
    return this.dataService.patients().reduce((sum, p) =>
      sum + p.treatments.filter(t => t.category === 'medico-no-invasivo').reduce((s, t) => s + t.totalPaid, 0), 0
    );
  });

  readonly cosmeticRevenue = computed(() => {
    return this.dataService.patients().reduce((sum, p) =>
      sum + p.treatments.filter(t => t.category === 'corporal-cosmetologia').reduce((s, t) => s + t.totalPaid, 0), 0
    );
  });

  // ─── Helpers for Administradora ───────────────────────────
  readonly patientsWithPendingBalanceCount = computed(() => {
    return this.dataService.patients().filter(p => this.getPatientBalance(p) > 0).length;
  });

  readonly pendingPatientsList = computed(() => {
    return this.dataService.patients().filter(p => this.getPatientBalance(p) > 0);
  });

  // ─── Helpers for Doctor ───────────────────────────────────
  readonly assignedDoctorPatients = computed(() => {
    return this.dataService.patients().filter(p => p.assignedSpecialistId === 'usr-003');
  });

  readonly activeDoctorTreatmentsCount = computed(() => {
    return this.assignedDoctorPatients().reduce((count, p) =>
      count + p.treatments.filter(t => t.category === 'medico-no-invasivo' && t.status === 'active').length, 0
    );
  });

  readonly completedDoctorSessionsCount = computed(() => {
    return this.assignedDoctorPatients().reduce((count, p) =>
      count + p.clinicalHistory.filter(h => h.specialistId === 'usr-003').length, 0
    );
  });

  // ─── Helpers for Cosmetologist ────────────────────────────
  readonly assignedCosmetologistPatients = computed(() => {
    return this.dataService.patients().filter(p => p.assignedSpecialistId === 'usr-004');
  });

  readonly activeCosmeticTreatmentsCount = computed(() => {
    return this.assignedCosmetologistPatients().reduce((count, p) =>
      count + p.treatments.filter(t => t.category === 'corporal-cosmetologia' && t.status === 'active').length, 0
    );
  });

  readonly completedCosmeticSessionsCount = computed(() => {
    return this.assignedCosmetologistPatients().reduce((count, p) =>
      count + p.clinicalHistory.filter(h => h.specialistId === 'usr-004').length, 0
    );
  });

  // ─── Shared Utilities ─────────────────────────────────────
  greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  currentDateFormatted(): string {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formatted = now.toLocaleDateString('es-ES', options);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  roleBadgeLabel(): string {
    const role = this.authService.currentRole();
    return role ? ROLE_LABELS[role] : 'Usuario';
  }

  roleHeadline(): string {
    const role = this.authService.currentRole();
    switch (role) {
      case 'gerente':
        return 'Panel de Dirección General · Supervisión ejecutiva de ingresos, márgenes, rentabilidad y volumen clínico.';
      case 'administradora':
        return 'Panel de Gestión Operativa · Control diario de caja, admisiones de pacientes y recaudación de cartera.';
      case 'medico':
        return 'Panel Clínico Especializado · Procedimientos médicos no invasivos, evolución y seguimiento de tus pacientes.';
      case 'cosmetologa':
        return 'Panel de Cabina Estética · Procedimientos corporales y faciales, aparatología y control de sesiones activas.';
      default:
        return 'Panel Principal';
    }
  }

  getPatientBalance(patient: Patient): number {
    return patient.treatments.reduce((sum, t) => sum + (t.totalCost - t.totalPaid), 0);
  }

  getPatientActiveMedicalTreatment(patient: Patient): string {
    const trt = patient.treatments.find(t => t.category === 'medico-no-invasivo');
    return trt ? `${trt.name} (${trt.completedSessions}/${trt.totalSessions} ses.)` : 'Sin procedimiento médico activo';
  }

  getPatientActiveCosmeticTreatment(patient: Patient): string {
    const trt = patient.treatments.find(t => t.category === 'corporal-cosmetologia');
    return trt ? `${trt.name} (${trt.completedSessions}/${trt.totalSessions} ses.)` : 'Sin tratamiento corporal activo';
  }

  openPatient(id: string): void {
    this.router.navigate(['/pacientes', id]);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
