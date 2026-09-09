import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { AuthService } from '../../core/services/auth.service';
import { CurrencyCopPipe } from '../../shared/pipes/currency-cop.pipe';
import { Patient } from '../../core/models/patient.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyCopPipe],
  template: `
    <div class="animate-fade-in">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-zinc-900">Pacientes</h1>
          <p class="text-sm text-zinc-400 mt-0.5">
            {{ filteredPatients().length }} paciente{{ filteredPatients().length !== 1 ? 's' : '' }} registrado{{ filteredPatients().length !== 1 ? 's' : '' }}
          </p>
        </div>
        <button class="btn-primary">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo Paciente
        </button>
      </div>

      <!-- Search Bar -->
      <div class="relative mb-6">
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

      <!-- Financial Summary (Admin only) -->
      @if (authService.isAdmin()) {
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div class="card p-5">
            <p class="micro-label mb-1">Total Cobrado</p>
            <p class="text-2xl font-bold tracking-tight text-zinc-900">{{ dataService.financialSummary().totalCollected | currencyCop }}</p>
          </div>
          <div class="card p-5">
            <p class="micro-label mb-1">Total Gastos</p>
            <p class="text-2xl font-bold tracking-tight text-zinc-900">{{ dataService.financialSummary().totalExpenses | currencyCop }}</p>
          </div>
          <div class="card p-5">
            <p class="micro-label mb-1">Balance Neto</p>
            <p class="text-2xl font-bold tracking-tight"
               [class.text-emerald-600]="dataService.financialSummary().netBalance >= 0"
               [class.text-rose-600]="dataService.financialSummary().netBalance < 0"
            >
              {{ dataService.financialSummary().netBalance | currencyCop }}
            </p>
          </div>
        </div>
      }

      <!-- Role Switcher (Demo) -->
      <div class="flex items-center gap-2 mb-6 pb-6 border-b border-zinc-100">
        <span class="text-[10px] font-semibold uppercase tracking-widest text-zinc-300 mr-2">Vista como:</span>
        @for (user of authService.getMockUsers(); track user.id) {
          <button
            (click)="switchRole(user.role)"
            [class]="authService.currentUser()?.id === user.id
              ? 'px-3 py-1.5 rounded-full text-xs font-semibold bg-black text-white shadow-sm transition-all duration-200'
              : 'px-3 py-1.5 rounded-full text-xs font-medium text-zinc-500 bg-zinc-100 hover:bg-zinc-200 transition-all duration-200'
            "
          >
            {{ user.name.split(' ')[0] }} · {{ user.role }}
          </button>
        }
      </div>

      <!-- Patient Grid -->
      @if (filteredPatients().length === 0) {
        <div class="text-center py-16">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-100 mb-4">
            <svg class="w-8 h-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
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

              <!-- Active Treatment -->
              @if (getActiveTreatment(patient); as treatment) {
                <div class="bg-zinc-50/80 rounded-xl px-3.5 py-3 mb-3">
                  <p class="text-xs font-medium text-zinc-600 truncate">{{ treatment.name }}</p>
                  <div class="flex items-center justify-between mt-2">
                    <span class="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                      Sesión {{ treatment.completedSessions }}/{{ treatment.totalSessions }}
                    </span>
                    <div class="w-20 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                      <div class="h-full bg-black rounded-full transition-all duration-500" [style.width.%]="(treatment.completedSessions / treatment.totalSessions) * 100"></div>
                    </div>
                  </div>
                </div>
              }

              <!-- Balance Badge -->
              @if (authService.isAdmin()) {
                @if (getPatientBalance(patient); as balance) {
                  @if (balance > 0) {
                    <div class="flex items-center gap-1.5">
                      <span class="badge-pending">
                        <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Saldo: {{ balance | currencyCop }}
                      </span>
                    </div>
                  } @else {
                    <div class="flex items-center gap-1.5">
                      <span class="badge-completed">
                        <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Al día
                      </span>
                    </div>
                  }
                }
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class DashboardComponent {
  readonly dataService = inject(MockDataService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly searchQuery = signal('');

  readonly filteredPatients = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    let patients = this.dataService.patients();

    // RBAC: clinical roles only see their assigned patients
    if (this.authService.isClinical()) {
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

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  getActiveTreatment(patient: Patient) {
    return patient.treatments.find(t => t.status === 'active') || patient.treatments[0];
  }

  getPatientBalance(patient: Patient): number {
    return patient.treatments.reduce((sum, t) => sum + (t.totalCost - t.totalPaid), 0);
  }

  switchRole(role: string): void {
    this.authService.switchRole(role as any);
  }

  openPatient(id: string): void {
    this.router.navigate(['/pacientes', id]);
  }
}
