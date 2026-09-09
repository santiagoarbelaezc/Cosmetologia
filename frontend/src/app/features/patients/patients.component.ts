import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { AuthService } from '../../core/services/auth.service';
import { PermissionsService } from '../../core/services/permissions.service';
import { WorkflowDiagramComponent } from '../../shared/components/workflow-diagram/workflow-diagram.component';
import { Patient } from '../../core/models/patient.model';

type PatientFilterTab = 'all' | 'active' | 'completed';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, WorkflowDiagramComponent],
  template: `
    <div class="animate-fade-in space-y-6 w-full">

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- HEADER: Clientes & Control de Flujo                      -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <section class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-100">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="micro-label">Módulo Clínico</span>
            <span class="text-zinc-300">·</span>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 uppercase tracking-wider">
              {{ permissions.canViewAllPatients() ? 'Directorio General' : 'Pacientes Asignados' }}
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            Expedientes & Flujo de Pacientes
          </h1>
          <p class="text-sm text-zinc-500 mt-0.5">
            Selecciona un cliente para visualizar su diagrama de progreso terapéutico, hitos y notas en tiempo real
          </p>
        </div>

        @if (permissions.canCreatePatient()) {
          <div class="flex items-center gap-3">
            <button
              (click)="focusSearch()"
              class="btn-primary text-xs sm:text-sm px-5 py-2.5 shadow-sm"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nuevo Paciente
            </button>
          </div>
        }
      </section>

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- MAIN SPLIT: Elegant Client List & Workflow Diagram        -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">

        <!-- ─── COLUMN 1: Minimalist, Elegant Patient List (5 cols) ─── -->
        <div class="lg:col-span-5 space-y-3">
          
          <!-- Search & Filter Controls -->
          <div class="card p-3.5 bg-white border border-zinc-200/80 shadow-xs space-y-3">
            <div class="relative">
              <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                #searchInput
                type="text"
                class="input-premium pl-10 text-sm py-2 bg-zinc-50/70 border-zinc-200"
                placeholder="Buscar por nombre o documento..."
                [value]="searchQuery()"
                (input)="onSearch($event)"
              />
            </div>

            <!-- Sleek Filter Pills -->
            <div class="flex items-center gap-1.5 text-xs">
              <button
                (click)="activeTab.set('all')"
                class="px-3 py-1 rounded-full font-medium transition-all"
                [ngClass]="activeTab() === 'all' ? 'bg-black text-white font-semibold shadow-xs' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
              >
                Todos ({{ allRolePatients().length }})
              </button>
              <button
                (click)="activeTab.set('active')"
                class="px-3 py-1 rounded-full font-medium transition-all"
                [ngClass]="activeTab() === 'active' ? 'bg-black text-white font-semibold shadow-xs' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
              >
                En Tratamiento ({{ activeCount() }})
              </button>
              <button
                (click)="activeTab.set('completed')"
                class="px-3 py-1 rounded-full font-medium transition-all"
                [ngClass]="activeTab() === 'completed' ? 'bg-black text-white font-semibold shadow-xs' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
              >
                Alta ({{ completedCount() }})
              </button>
            </div>
          </div>

          <!-- Clean Patient Cards (Minimalist & Uncluttered) -->
          <div class="space-y-2 max-h-[750px] overflow-y-auto pr-1">
            @if (filteredPatients().length === 0) {
              <div class="text-center py-12 card p-6 bg-white border border-zinc-200/80">
                <p class="text-sm font-semibold text-zinc-600">No se encontraron pacientes</p>
                <p class="text-xs text-zinc-400 mt-1">Prueba con otro término de búsqueda</p>
              </div>
            } @else {
              @for (patient of filteredPatients(); track patient.id) {
                <div
                  (click)="selectPatient(patient)"
                  class="p-3.5 rounded-xl cursor-pointer transition-all duration-200 border flex items-center justify-between gap-3"
                  [ngClass]="selectedPatient()?.id === patient.id 
                    ? 'border-zinc-900 ring-1 ring-zinc-900 bg-zinc-900 text-white shadow-sm' 
                    : 'bg-white border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50/60'"
                >
                  <!-- Avatar + Basic Info -->
                  <div class="flex items-center gap-3 min-w-0">
                    <div
                      class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors"
                      [ngClass]="selectedPatient()?.id === patient.id 
                        ? 'bg-zinc-800 text-zinc-100 border border-zinc-700' 
                        : 'bg-zinc-100 text-zinc-700'"
                    >
                      {{ patient.firstName.charAt(0) }}{{ patient.lastName.charAt(0) }}
                    </div>

                    <div class="min-w-0">
                      <h4
                        class="text-sm font-semibold truncate leading-tight"
                        [ngClass]="selectedPatient()?.id === patient.id ? 'text-white' : 'text-zinc-900'"
                      >
                        {{ patient.firstName }} {{ patient.lastName }}
                      </h4>
                      <p
                        class="text-xs mt-0.5 truncate"
                        [ngClass]="selectedPatient()?.id === patient.id ? 'text-zinc-400' : 'text-zinc-500'"
                      >
                        CC {{ patient.documentId }}
                      </p>
                    </div>
                  </div>

                  <!-- Minimalist Status Dot / Tag -->
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <span
                      class="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full"
                      [ngClass]="selectedPatient()?.id === patient.id
                        ? 'bg-zinc-800 text-zinc-300'
                        : (isPatientActive(patient) ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-600')"
                    >
                      <span
                        class="w-1.5 h-1.5 rounded-full"
                        [ngClass]="selectedPatient()?.id === patient.id
                          ? 'bg-emerald-400'
                          : (isPatientActive(patient) ? 'bg-emerald-500' : 'bg-zinc-400')"
                      ></span>
                      {{ isPatientActive(patient) ? 'Activo' : 'Alta' }}
                    </span>

                    <svg
                      class="w-4 h-4 transition-transform"
                      [ngClass]="selectedPatient()?.id === patient.id ? 'text-zinc-400 translate-x-0.5' : 'text-zinc-300'"
                      fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              }
            }
          </div>
        </div>

        <!-- ─── COLUMN 2: Patient Workflow Profile (7 cols) ─────────── -->
        <div class="lg:col-span-7 space-y-5">
          @if (selectedPatient(); as p) {
            
            <!-- Sleek Patient Banner Card -->
            <div class="card p-6 bg-white border border-zinc-200/90 shadow-sm rounded-2xl">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center font-bold text-lg text-zinc-700 flex-shrink-0">
                    {{ p.firstName.charAt(0) }}{{ p.lastName.charAt(0) }}
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="text-xl font-bold text-zinc-900">
                        {{ p.firstName }} {{ p.lastName }}
                      </h3>
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                            [ngClass]="isPatientActive(p) ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-600'">
                        {{ isPatientActive(p) ? 'Tratamiento en Curso' : 'Ciclo Finalizado' }}
                      </span>
                    </div>
                    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 mt-1">
                      <span>CC: {{ p.documentId }}</span>
                      <span>·</span>
                      <span>{{ p.phone }}</span>
                      <span>·</span>
                      <span>{{ p.email }}</span>
                    </div>
                  </div>
                </div>

                <button
                  (click)="openPatient(p.id)"
                  class="btn-primary text-xs sm:text-sm px-5 py-2.5 self-start sm:self-auto flex-shrink-0"
                >
                  <span>Ver Expediente Completo</span>
                  <svg class="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>

              <!-- Quick Clinical Metadata -->
              <div class="mt-5 pt-4 border-t border-zinc-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span class="micro-label">Especialista Asignado</span>
                  <p class="font-bold text-zinc-800 text-sm mt-0.5">{{ getSpecialistName(p.assignedSpecialistId) }}</p>
                </div>
                <div>
                  <span class="micro-label">Fecha de Ingreso</span>
                  <p class="font-bold text-zinc-800 text-sm mt-0.5">{{ p.createdAt }}</p>
                </div>
                <div>
                  <span class="micro-label">Sesiones Acumuladas</span>
                  <p class="font-bold text-zinc-800 text-sm mt-0.5">
                    {{ getPatientTotalSessions(p).completed }} de {{ getPatientTotalSessions(p).total }} realizadas
                  </p>
                </div>
              </div>
            </div>

            <!-- ─── THE CLINICAL WORKFLOW DIAGRAM ─────────────────────── -->
            <app-workflow-diagram
              [patient]="p"
              (viewFullProfile)="openPatient($event)"
            />

          } @else {
            <!-- Empty state -->
            <div class="card p-12 text-center bg-white border border-zinc-200/90 rounded-2xl">
              <div class="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h4 class="text-base font-bold text-zinc-800">Ningún paciente seleccionado</h4>
              <p class="text-xs text-zinc-500 mt-1">Selecciona un paciente en la lista para cargar su diagrama de workflow clínico.</p>
            </div>
          }
        </div>

      </section>

    </div>
  `,
})
export class PatientsComponent {
  readonly dataService = inject(MockDataService);
  readonly authService = inject(AuthService);
  readonly permissions = inject(PermissionsService);
  private readonly router = inject(Router);

  readonly searchQuery = signal('');
  readonly activeTab = signal<PatientFilterTab>('all');
  readonly selectedPatient = signal<Patient | null>(null);

  readonly allRolePatients = computed(() => {
    let patients = this.dataService.patients();
    if (!this.permissions.canViewAllPatients()) {
      const userId = this.authService.currentUser()?.id;
      patients = patients.filter(p => p.assignedSpecialistId === userId);
    }
    return patients;
  });

  readonly filteredPatients = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const tab = this.activeTab();
    let list = this.allRolePatients();

    if (tab === 'active') {
      list = list.filter(p => this.isPatientActive(p));
    } else if (tab === 'completed') {
      list = list.filter(p => !this.isPatientActive(p));
    }

    if (query) {
      list = list.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(query) ||
        p.documentId.toLowerCase().includes(query)
      );
    }

    return list;
  });

  readonly activeCount = computed(() => {
    return this.allRolePatients().filter(p => this.isPatientActive(p)).length;
  });

  readonly completedCount = computed(() => {
    return this.allRolePatients().filter(p => !this.isPatientActive(p)).length;
  });

  constructor() {
    const first = this.allRolePatients()[0];
    if (first) {
      this.selectedPatient.set(first);
    }
  }

  isPatientActive(patient: Patient): boolean {
    return patient.treatments.some(t => t.status === 'active');
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient.set(patient);
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);

    const filtered = this.filteredPatients();
    if (filtered.length > 0 && (!this.selectedPatient() || !filtered.some(p => p.id === this.selectedPatient()?.id))) {
      this.selectedPatient.set(filtered[0]);
    }
  }

  focusSearch(): void {
    const el = document.querySelector('input[placeholder*="Buscar por nombre"]') as HTMLInputElement;
    if (el) el.focus();
  }

  getSpecialistName(specialistId: string): string {
    if (specialistId === 'usr-003') return 'Dr. Andrés Castaño';
    if (specialistId === 'usr-004') return 'Camila Herrera';
    return 'Especialista Asignado';
  }

  getPatientTotalSessions(patient: Patient): { completed: number; total: number } {
    const total = patient.treatments.reduce((acc, t) => acc + t.totalSessions, 0);
    const completed = patient.treatments.reduce((acc, t) => acc + t.completedSessions, 0);
    return { completed, total };
  }

  openPatient(id: string): void {
    this.router.navigate(['/pacientes', id]);
  }
}
