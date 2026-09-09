import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { AuthService } from '../../core/services/auth.service';
import { PermissionsService } from '../../core/services/permissions.service';
import { CurrencyCopPipe } from '../../shared/pipes/currency-cop.pipe';
import { Patient } from '../../core/models/patient.model';
import { ROLE_LABELS } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyCopPipe],
  template: `
    <div class="animate-fade-in space-y-8">

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- SECTION 1: Welcome Header                              -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section>
        <div class="flex items-start justify-between">
          <div>
            <p class="micro-label mb-1">{{ greeting() }}</p>
            <h1 class="text-2xl font-bold tracking-tight text-zinc-900">
              {{ authService.currentUser()?.name }}
            </h1>
            <p class="text-sm text-zinc-400 mt-1">
              {{ roleDescription() }}
            </p>
          </div>
          <div class="flex-shrink-0">
            <div class="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center">
              <span class="text-lg font-bold text-zinc-500">
                {{ authService.currentUser()?.name?.charAt(0) }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- SECTION 2: Financial Overview (Gerente + Admin only)   -->
      <!-- ═══════════════════════════════════════════════════════ -->
      @if (permissions.canViewCashBalance()) {
        <section>
          <div class="flex items-center justify-between mb-4">
            <h2 class="section-title">Resumen Financiero</h2>
            @if (permissions.canViewExpenses()) {
              <a (click)="navigateTo('/gastos')" class="btn-ghost text-xs cursor-pointer">
                Ver detalle
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </a>
            }
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4"
               [class.sm:grid-cols-3]="permissions.canViewNetBalance()">
            <!-- Total Cobrado -->
            <div class="card p-5">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <svg class="w-4.5 h-4.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                </div>
                <p class="micro-label">Total Cobrado</p>
              </div>
              <p class="text-2xl font-bold tracking-tight text-zinc-900">
                {{ dataService.financialSummary().totalCollected | currencyCop }}
              </p>
            </div>

            <!-- Total Gastos -->
            <div class="card p-5">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                  <svg class="w-4.5 h-4.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p class="micro-label">Total Gastos</p>
              </div>
              <p class="text-2xl font-bold tracking-tight text-rose-500">
                {{ dataService.financialSummary().totalExpenses | currencyCop }}
              </p>
            </div>

            <!-- Balance Neto — SOLO GERENTE -->
            @if (permissions.canViewNetBalance()) {
              <div class="card p-5 border-black/10">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center">
                    <svg class="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                  </div>
                  <p class="micro-label">Balance Neto</p>
                </div>
                <p class="text-2xl font-bold tracking-tight"
                   [class.text-emerald-600]="dataService.financialSummary().netBalance >= 0"
                   [class.text-rose-600]="dataService.financialSummary().netBalance < 0">
                  {{ dataService.financialSummary().netBalance | currencyCop }}
                </p>
                <p class="text-[10px] text-zinc-400 mt-1">Utilidad del negocio</p>
              </div>
            }
          </div>
        </section>
      }

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- SECTION 3: Quick Stats (Clinical users)                -->
      <!-- ═══════════════════════════════════════════════════════ -->
      @if (!permissions.canViewCashBalance()) {
        <section>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="card p-5">
              <p class="micro-label mb-1">Mis Pacientes</p>
              <p class="text-3xl font-bold tracking-tight text-zinc-900">{{ filteredPatients().length }}</p>
            </div>
            <div class="card p-5">
              <p class="micro-label mb-1">Tratamientos Activos</p>
              <p class="text-3xl font-bold tracking-tight text-zinc-900">{{ activeTreatmentCount() }}</p>
            </div>
            <div class="card p-5">
              <p class="micro-label mb-1">Mi Especialidad</p>
              <p class="text-sm font-semibold text-zinc-700 mt-1">{{ specialtyLabel() }}</p>
            </div>
          </div>
        </section>
      }

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- SECTION 4: Patient Search & Filter                     -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="section-title">
            {{ permissions.canViewAllPatients() ? 'Todos los Pacientes' : 'Mis Pacientes Asignados' }}
          </h2>
          @if (permissions.canCreatePatient()) {
            <button class="btn-primary text-xs px-4 py-2">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nuevo Paciente
            </button>
          }
        </div>

        <!-- Search Bar -->
        <div class="relative mb-5">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            class="input-premium pl-11"
            placeholder="Buscar por nombre, documento o tratamiento..."
            [value]="searchQuery()"
            (input)="onSearch($event)"
          />
        </div>

        <!-- Patient Count -->
        <p class="text-xs text-zinc-400 mb-4">
          {{ filteredPatients().length }} paciente{{ filteredPatients().length !== 1 ? 's' : '' }}
        </p>

        <!-- Patient Grid -->
        @if (filteredPatients().length === 0) {
          <div class="text-center py-16 card">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-100 mb-4">
              <svg class="w-7 h-7 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
            </div>
            <p class="text-sm font-medium text-zinc-500">No se encontraron pacientes</p>
            <p class="text-xs text-zinc-400 mt-1">Intenta con otro término de búsqueda</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            @for (patient of filteredPatients(); track patient.id) {
              <div
                (click)="openPatient(patient.id)"
                class="card-hover p-5 cursor-pointer group"
              >
                <!-- Patient Header -->
                <div class="flex items-start gap-3.5 mb-4">
                  <div class="w-11 h-11 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0 group-hover:bg-zinc-200 transition-colors">
                    <span class="text-sm font-bold text-zinc-500">
                      {{ patient.firstName.charAt(0) }}{{ patient.lastName.charAt(0) }}
                    </span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="text-sm font-bold text-zinc-900 truncate">
                      {{ patient.firstName }} {{ patient.lastName }}
                    </h3>
                    <p class="text-xs text-zinc-400 mt-0.5">{{ patient.documentId }}</p>
                  </div>
                  <svg class="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors mt-0.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>

                <!-- Active Treatment (filtered by role specialty) -->
                @if (getVisibleTreatment(patient); as treatment) {
                  <div class="bg-zinc-50/80 rounded-xl px-3.5 py-3 mb-3">
                    <p class="text-xs font-medium text-zinc-600 truncate">{{ treatment.name }}</p>
                    <div class="flex items-center justify-between mt-2">
                      <span class="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                        Sesión {{ treatment.completedSessions }}/{{ treatment.totalSessions }}
                      </span>
                      <div class="w-20 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                        <div class="h-full bg-black rounded-full transition-all duration-500"
                             [style.width.%]="(treatment.completedSessions / treatment.totalSessions) * 100"></div>
                      </div>
                    </div>
                  </div>
                }

                <!-- Balance Badge (financial roles only) -->
                @if (permissions.canViewFinancials()) {
                  @if (getPatientBalance(patient); as balance) {
                    @if (balance > 0) {
                      <span class="badge-pending">
                        <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Saldo: {{ balance | currencyCop }}
                      </span>
                    } @else {
                      <span class="badge-completed">
                        <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Al día
                      </span>
                    }
                  }
                }
              </div>
            }
          </div>
        }
      </section>

    </div>
  `,
})
export class DashboardComponent {
  readonly dataService = inject(MockDataService);
  readonly authService = inject(AuthService);
  readonly permissions = inject(PermissionsService);
  private readonly router = inject(Router);

  readonly searchQuery = signal('');

  readonly filteredPatients = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    let patients = this.dataService.patients();

    // RBAC: clinical roles only see their assigned patients
    if (!this.permissions.canViewAllPatients()) {
      const userId = this.authService.currentUser()?.id;
      patients = patients.filter(p => p.assignedSpecialistId === userId);
    }

    if (!query) return patients;

    return patients.filter(p =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(query) ||
      p.documentId.toLowerCase().includes(query) ||
      p.treatments.some(t => t.name.toLowerCase().includes(query))
    );
  });

  readonly activeTreatmentCount = computed(() => {
    return this.filteredPatients().reduce((count, p) =>
      count + p.treatments.filter(t => t.status === 'active').length, 0
    );
  });

  readonly specialtyLabel = computed(() => {
    const role = this.authService.currentRole();
    switch (role) {
      case 'medico': return 'Procedimientos Médicos No Invasivos';
      case 'cosmetologa': return 'Servicios Corporales / Cosmetología';
      default: return 'Todas las especialidades';
    }
  });

  greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  roleDescription(): string {
    const role = this.authService.currentRole();
    switch (role) {
      case 'gerente':
        return 'Visión estratégica completa · Finanzas, pacientes y operación';
      case 'administradora':
        return 'Operación diaria · Caja, agenda, pacientes y pagos';
      case 'medico':
        return 'Procedimientos médicos no invasivos · Tus pacientes asignados';
      case 'cosmetologa':
        return 'Servicios corporales y estéticos · Tus pacientes asignados';
      default:
        return '';
    }
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  getVisibleTreatment(patient: Patient) {
    const categories = this.permissions.visibleTreatmentCategories();
    const visible = patient.treatments.filter(t => categories.includes(t.category));
    return visible.find(t => t.status === 'active') || visible[0];
  }

  getPatientBalance(patient: Patient): number {
    return patient.treatments.reduce((sum, t) => sum + (t.totalCost - t.totalPaid), 0);
  }

  openPatient(id: string): void {
    this.router.navigate(['/pacientes', id]);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
