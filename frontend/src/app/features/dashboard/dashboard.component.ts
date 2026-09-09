import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { AuthService } from '../../core/services/auth.service';
import { PermissionsService } from '../../core/services/permissions.service';
import { CurrencyCopPipe } from '../../shared/pipes/currency-cop.pipe';
import { WorkflowDiagramComponent } from '../../shared/components/workflow-diagram/workflow-diagram.component';
import { Patient, Treatment } from '../../core/models/patient.model';
import { ROLE_LABELS } from '../../core/models/user.model';

type PatientFilterTab = 'all' | 'active' | 'completed' | 'with-balance';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyCopPipe, WorkflowDiagramComponent],
  template: `
    <div class="animate-fade-in space-y-7 w-full">

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- SECTION 1: Welcome Header & Operating Context            -->
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
              {{ roleDescription() }}
            </p>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex flex-wrap items-center gap-3">
            @if (permissions.canCreatePatient()) {
              <button
                (click)="focusSearch()"
                class="btn-primary text-xs sm:text-sm px-5 py-2.5 shadow-sm"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Nuevo Paciente
              </button>
            }

            @if (permissions.canViewExpenses()) {
              <button
                (click)="navigateTo('/gastos')"
                class="btn-secondary text-xs sm:text-sm px-4 py-2.5"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                Finanzas & Caja
              </button>
            }
          </div>
        </div>
      </section>

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- SECTION 2: Metric Highlights (Granular by Role)           -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <section>
        @if (permissions.canViewCashBalance()) {
          <!-- Financial & Operational Stats (Gerente & Administradora) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Total Cobrado -->
            <div class="card p-5 bg-white border border-zinc-200/90">
              <div class="flex items-center justify-between mb-3">
                <span class="micro-label">Total Cobrado</span>
                <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p class="text-2xl font-bold tracking-tight text-zinc-900">
                {{ dataService.financialSummary().totalCollected | currencyCop }}
              </p>
              <p class="text-xs text-zinc-400 mt-1">Ingresos brutos acumulados</p>
            </div>

            <!-- Total Gastos -->
            <div class="card p-5 bg-white border border-zinc-200/90">
              <div class="flex items-center justify-between mb-3">
                <span class="micro-label">Gastos Registrados</span>
                <div class="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                  </svg>
                </div>
              </div>
              <p class="text-2xl font-bold tracking-tight text-rose-600">
                {{ dataService.financialSummary().totalExpenses | currencyCop }}
              </p>
              <p class="text-xs text-zinc-400 mt-1">Egresos operativos del centro</p>
            </div>

            <!-- Utilidad Neta (Solo Gerente) o Saldo Pendiente Pacientes (Admin) -->
            @if (permissions.canViewNetBalance()) {
              <div class="card p-5 bg-zinc-900 text-white border border-zinc-800">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Utilidad Neta</span>
                  <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <p class="text-2xl font-bold tracking-tight text-white">
                  {{ dataService.financialSummary().netBalance | currencyCop }}
                </p>
                <p class="text-xs text-zinc-400 mt-1">Margen neto estratégico</p>
              </div>
            } @else {
              <div class="card p-5 bg-white border border-zinc-200/90">
                <div class="flex items-center justify-between mb-3">
                  <span class="micro-label">Cuentas por Cobrar</span>
                  <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p class="text-2xl font-bold tracking-tight text-zinc-900">
                  {{ totalPendingBalance() | currencyCop }}
                </p>
                <p class="text-xs text-zinc-400 mt-1">Saldos pendientes de pacientes</p>
              </div>
            }

            <!-- Pacientes Totales -->
            <div class="card p-5 bg-white border border-zinc-200/90">
              <div class="flex items-center justify-between mb-3">
                <span class="micro-label">Pacientes en Sistema</span>
                <div class="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
              </div>
              <p class="text-2xl font-bold tracking-tight text-zinc-900">{{ filteredPatients().length }}</p>
              <p class="text-xs text-zinc-400 mt-1">{{ activeTreatmentsCount() }} tratamientos en curso</p>
            </div>
          </div>
        } @else {
          <!-- Clinical Users Metrics (Doctor / Cosmetóloga) -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="card p-5 bg-white border border-zinc-200/90">
              <span class="micro-label">Mis Pacientes Asignados</span>
              <p class="text-3xl font-bold tracking-tight text-zinc-900 mt-2">{{ filteredPatients().length }}</p>
              <p class="text-xs text-zinc-400 mt-1">Bajo mi supervisión directa</p>
            </div>

            <div class="card p-5 bg-white border border-zinc-200/90">
              <span class="micro-label">Tratamientos en Curso</span>
              <p class="text-3xl font-bold tracking-tight text-zinc-900 mt-2">{{ activeTreatmentsCount() }}</p>
              <p class="text-xs text-zinc-400 mt-1">Sesiones programadas activas</p>
            </div>

            <div class="card p-5 bg-white border border-zinc-200/90">
              <span class="micro-label">Especialidad Clínica</span>
              <p class="text-base font-bold text-zinc-900 mt-2 truncate">{{ specialtyLabel() }}</p>
              <p class="text-xs text-emerald-600 font-medium mt-1">Perfil clínico autorizado</p>
            </div>
          </div>
        }
      </section>

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- SECTION 3: Main Wide Area — Patient List & Workflow View  -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <section class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-bold tracking-tight text-zinc-900">
              Flujo Clínico & Expedientes de Pacientes
            </h2>
            <p class="text-xs sm:text-sm text-zinc-500">
              Selecciona un paciente de la lista para inspeccionar su diagrama de progreso, hitos y notas en tiempo real
            </p>
          </div>

          <div class="text-xs text-zinc-400">
            Mostrando {{ filteredPatients().length }} de {{ allRolePatients().length }} pacientes
          </div>
        </div>

        <!-- 2-Column Split: List on Left (40%), Workflow Diagram on Right (60%) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          <!-- ─── COLUMN 1: Organised Patient List (5 of 12 cols) ───── -->
          <div class="lg:col-span-5 space-y-4">
            
            <!-- Filters Bar & Search -->
            <div class="card p-4 bg-white border border-zinc-200/90 space-y-3">
              <!-- Search Input -->
              <div class="relative">
                <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  #searchInput
                  type="text"
                  class="input-premium pl-10 text-sm py-2.5"
                  placeholder="Buscar paciente, documento o tratamiento..."
                  [value]="searchQuery()"
                  (input)="onSearch($event)"
                />
              </div>

              <!-- Filter Tabs / Pills -->
              <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  (click)="activeTab.set('all')"
                  class="px-3 py-1.5 rounded-full font-medium transition-all"
                  [ngClass]="activeTab() === 'all' ? 'bg-black text-white font-semibold' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
                >
                  Todos ({{ allRolePatients().length }})
                </button>
                <button
                  (click)="activeTab.set('active')"
                  class="px-3 py-1.5 rounded-full font-medium transition-all"
                  [ngClass]="activeTab() === 'active' ? 'bg-black text-white font-semibold' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
                >
                  Activos ({{ activeCount() }})
                </button>
                <button
                  (click)="activeTab.set('completed')"
                  class="px-3 py-1.5 rounded-full font-medium transition-all"
                  [ngClass]="activeTab() === 'completed' ? 'bg-black text-white font-semibold' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
                >
                  Alta ({{ completedCount() }})
                </button>
                @if (permissions.canViewFinancials()) {
                  <button
                    (click)="activeTab.set('with-balance')"
                    class="px-3 py-1.5 rounded-full font-medium transition-all"
                    [ngClass]="activeTab() === 'with-balance' ? 'bg-rose-500 text-white font-semibold' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'"
                  >
                    Con Saldo ({{ pendingBalanceCount() }})
                  </button>
                }
              </div>
            </div>

            <!-- Scrollable Patient Cards List -->
            <div class="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
              @if (filteredPatients().length === 0) {
                <div class="text-center py-12 card p-6">
                  <p class="text-sm font-semibold text-zinc-600">No se encontraron pacientes</p>
                  <p class="text-xs text-zinc-400 mt-1">Prueba cambiando el término de búsqueda o el filtro</p>
                </div>
              } @else {
                @for (patient of filteredPatients(); track patient.id) {
                  <div
                    (click)="selectPatient(patient)"
                    class="card p-4 cursor-pointer transition-all duration-200 group relative border"
                    [ngClass]="selectedPatient()?.id === patient.id 
                      ? 'border-zinc-900 ring-2 ring-zinc-900 bg-zinc-50/60 shadow-md' 
                      : 'border-zinc-200/80 hover:border-zinc-400 hover:bg-zinc-50/30'"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <!-- Patient Info -->
                      <div class="flex items-center gap-3 min-w-0">
                        <div
                          class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors"
                          [ngClass]="selectedPatient()?.id === patient.id ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'"
                        >
                          {{ patient.firstName.charAt(0) }}{{ patient.lastName.charAt(0) }}
                        </div>
                        <div class="min-w-0">
                          <h4 class="text-sm font-bold text-zinc-900 truncate group-hover:text-black">
                            {{ patient.firstName }} {{ patient.lastName }}
                          </h4>
                          <p class="text-xs text-zinc-400">CC: {{ patient.documentId }}</p>
                        </div>
                      </div>

                      <!-- Selection Tag or Status -->
                      @if (selectedPatient()?.id === patient.id) {
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black text-white flex-shrink-0">
                          Viendo Flujo
                        </span>
                      }
                    </div>

                    <!-- Active Treatment Progress -->
                    @if (getVisibleTreatment(patient); as treatment) {
                      <div class="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-xs">
                        <div class="min-w-0 flex-1 mr-3">
                          <p class="text-zinc-600 truncate font-medium">{{ treatment.name }}</p>
                          <div class="flex items-center gap-2 mt-1">
                            <div class="w-20 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                              <div
                                class="h-full bg-black rounded-full"
                                [style.width.%]="(treatment.completedSessions / treatment.totalSessions) * 100"
                              ></div>
                            </div>
                            <span class="text-[11px] font-semibold text-zinc-400">
                              {{ treatment.completedSessions }}/{{ treatment.totalSessions }} ses.
                            </span>
                          </div>
                        </div>

                        <!-- Financial balance if authorized -->
                        @if (permissions.canViewFinancials()) {
                          @if (getPatientBalance(patient); as balance) {
                            @if (balance > 0) {
                              <span class="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                                Saldo: {{ balance | currencyCop }}
                              </span>
                            } @else {
                              <span class="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                Al día
                              </span>
                            }
                          }
                        }
                      </div>
                    }
                  </div>
                }
              }
            </div>
          </div>

          <!-- ─── COLUMN 2: Workflow Diagram & Deep Patient Overview (7 of 12 cols) ─ -->
          <div class="lg:col-span-7 space-y-5">
            @if (selectedPatient(); as p) {
              
              <!-- Patient Summary Card with Direct Action -->
              <div class="card p-5 sm:p-6 bg-white border border-zinc-200/90 shadow-sm rounded-2xl">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center font-bold text-lg text-zinc-600 flex-shrink-0">
                      {{ p.firstName.charAt(0) }}{{ p.lastName.charAt(0) }}
                    </div>
                    <div>
                      <h3 class="text-lg sm:text-xl font-bold text-zinc-900">
                        {{ p.firstName }} {{ p.lastName }}
                      </h3>
                      <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 mt-1">
                        <span>CC: {{ p.documentId }}</span>
                        <span>·</span>
                        <span>Tel: {{ p.phone }}</span>
                        <span>·</span>
                        <span>Desde: {{ p.createdAt }}</span>
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

                <!-- Treatments Summary Bar inside patient card -->
                <div class="mt-4 pt-4 border-t border-zinc-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span class="micro-label">Tratamientos</span>
                    <p class="font-bold text-zinc-900 text-sm mt-0.5">{{ p.treatments.length }} formulados</p>
                  </div>
                  <div>
                    <span class="micro-label">Sesiones Totales</span>
                    <p class="font-bold text-zinc-900 text-sm mt-0.5">
                      {{ getPatientTotalSessions(p).completed }} / {{ getPatientTotalSessions(p).total }}
                    </p>
                  </div>
                  <div>
                    <span class="micro-label">Especialista</span>
                    <p class="font-bold text-zinc-800 text-sm mt-0.5 truncate">{{ getSpecialistName(p.assignedSpecialistId) }}</p>
                  </div>
                  @if (permissions.canViewFinancials()) {
                    <div>
                      <span class="micro-label">Estado de Pago</span>
                      <p class="font-bold text-sm mt-0.5" [ngClass]="getPatientBalance(p) > 0 ? 'text-rose-600' : 'text-emerald-600'">
                        {{ getPatientBalance(p) > 0 ? 'Con saldo pendiente' : 'Al día' }}
                      </p>
                    </div>
                  }
                </div>
              </div>

              <!-- ─── INTERACTIVE WORKFLOW PROGRESS DIAGRAM COMPONENT ───── -->
              <app-workflow-diagram
                [patient]="p"
                (viewFullProfile)="openPatient($event)"
              />

              <!-- Treatments Breakdown Box -->
              <div class="card p-5 bg-white border border-zinc-200/90 rounded-2xl">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="text-sm font-bold text-zinc-900">Tratamientos del Plan Activo</h4>
                  <span class="text-xs text-zinc-400">Progreso individual</span>
                </div>

                <div class="space-y-3">
                  @for (trt of getVisibleTreatmentsForPatient(p); track trt.id) {
                    <div class="p-3.5 bg-zinc-50 border border-zinc-200/70 rounded-xl">
                      <div class="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p class="text-sm font-semibold text-zinc-900">{{ trt.name }}</p>
                          <p class="text-xs text-zinc-400">
                            {{ trt.category === 'corporal-cosmetologia' ? 'Corporal / Cosmetología' : 'Procedimiento Médico Especializado' }}
                          </p>
                        </div>
                        <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                              [ngClass]="trt.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-700'">
                          {{ trt.status === 'completed' ? 'Completado' : 'En Curso' }}
                        </span>
                      </div>

                      <div class="flex items-center justify-between text-xs mt-2">
                        <span class="text-zinc-500 font-medium">
                          {{ trt.completedSessions }} de {{ trt.totalSessions }} sesiones realizadas
                        </span>
                        <span class="font-bold text-zinc-800">
                          {{ Math.round((trt.completedSessions / trt.totalSessions) * 100) }}%
                        </span>
                      </div>
                      <div class="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden mt-1.5">
                        <div class="h-full bg-black rounded-full transition-all duration-500"
                             [style.width.%]="(trt.completedSessions / trt.totalSessions) * 100"></div>
                      </div>
                    </div>
                  }
                </div>
              </div>

            } @else {
              <!-- Fallback state if no patient is selected -->
              <div class="card p-12 text-center bg-white border border-zinc-200/90 rounded-2xl">
                <div class="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-3">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <h4 class="text-base font-bold text-zinc-800">Ningún paciente seleccionado</h4>
                <p class="text-xs text-zinc-500 mt-1">Selecciona un paciente en la lista izquierda para cargar su diagrama de workflow clínico.</p>
              </div>
            }
          </div>

        </div>
      </section>

    </div>
  `,
})
export class DashboardComponent {
  readonly dataService = inject(MockDataService);
  readonly authService = inject(AuthService);
  readonly permissions = inject(PermissionsService);
  private readonly router = inject(Router);

  readonly Math = Math;
  readonly searchQuery = signal('');
  readonly activeTab = signal<PatientFilterTab>('all');
  readonly selectedPatient = signal<Patient | null>(null);

  // All patients allowed by current user's role
  readonly allRolePatients = computed(() => {
    let patients = this.dataService.patients();
    if (!this.permissions.canViewAllPatients()) {
      const userId = this.authService.currentUser()?.id;
      patients = patients.filter(p => p.assignedSpecialistId === userId);
    }
    return patients;
  });

  // Filtered list by query and filter tab
  readonly filteredPatients = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const tab = this.activeTab();
    let list = this.allRolePatients();

    // Tab filter
    if (tab === 'active') {
      list = list.filter(p => p.treatments.some(t => t.status === 'active'));
    } else if (tab === 'completed') {
      list = list.filter(p => p.treatments.length > 0 && p.treatments.every(t => t.status === 'completed'));
    } else if (tab === 'with-balance') {
      list = list.filter(p => this.getPatientBalance(p) > 0);
    }

    // Text query
    if (query) {
      list = list.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(query) ||
        p.documentId.toLowerCase().includes(query) ||
        p.treatments.some(t => t.name.toLowerCase().includes(query))
      );
    }

    return list;
  });

  readonly activeCount = computed(() => {
    return this.allRolePatients().filter(p => p.treatments.some(t => t.status === 'active')).length;
  });

  readonly completedCount = computed(() => {
    return this.allRolePatients().filter(p => p.treatments.length > 0 && p.treatments.every(t => t.status === 'completed')).length;
  });

  readonly pendingBalanceCount = computed(() => {
    return this.allRolePatients().filter(p => this.getPatientBalance(p) > 0).length;
  });

  readonly totalPendingBalance = computed(() => {
    return this.allRolePatients().reduce((sum, p) => sum + this.getPatientBalance(p), 0);
  });

  readonly activeTreatmentsCount = computed(() => {
    return this.allRolePatients().reduce((count, p) =>
      count + p.treatments.filter(t => t.status === 'active').length, 0
    );
  });

  constructor() {
    // Automatically select the first patient on load
    const first = this.allRolePatients()[0];
    if (first) {
      this.selectedPatient.set(first);
    }
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient.set(patient);
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);

    // If current selected patient is no longer in filtered list, select first available
    const filtered = this.filteredPatients();
    if (filtered.length > 0 && (!this.selectedPatient() || !filtered.some(p => p.id === this.selectedPatient()?.id))) {
      this.selectedPatient.set(filtered[0]);
    }
  }

  focusSearch(): void {
    const el = document.querySelector('input[placeholder*="Buscar paciente"]') as HTMLInputElement;
    if (el) el.focus();
  }

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

  roleDescription(): string {
    const role = this.authService.currentRole();
    switch (role) {
      case 'gerente':
        return 'Dirección Estratégica & Financiera · Supervisión completa de pacientes, caja, egresos y rentabilidad clínica.';
      case 'administradora':
        return 'Gestión Operativa & Administrativa · Control de caja, admisiones, agenda de citas y abonos de pacientes.';
      case 'medico':
        return 'Atención Médica Especializada · Seguimiento de evolución y procedimientos médicos no invasivos de tus pacientes.';
      case 'cosmetologa':
        return 'Cuidado Estético & Corporal · Ejecución de protocolos, sesiones corporales y tratamientos cosméticos asignados.';
      default:
        return '';
    }
  }

  specialtyLabel(): string {
    const role = this.authService.currentRole();
    switch (role) {
      case 'medico': return 'Procedimientos Médicos No Invasivos';
      case 'cosmetologa': return 'Servicios Corporales / Cosmetología';
      default: return 'Atención Integral';
    }
  }

  getSpecialistName(specialistId: string): string {
    if (specialistId === 'usr-003') return 'Dr. Andrés Castaño';
    if (specialistId === 'usr-004') return 'Camila Herrera';
    return 'Especialista Asignado';
  }

  getVisibleTreatment(patient: Patient): Treatment | undefined {
    const categories = this.permissions.visibleTreatmentCategories();
    const visible = patient.treatments.filter(t => categories.includes(t.category));
    return visible.find(t => t.status === 'active') || visible[0];
  }

  getVisibleTreatmentsForPatient(patient: Patient): Treatment[] {
    const categories = this.permissions.visibleTreatmentCategories();
    return patient.treatments.filter(t => categories.includes(t.category));
  }

  getPatientTotalSessions(patient: Patient): { completed: number; total: number } {
    const total = patient.treatments.reduce((acc, t) => acc + t.totalSessions, 0);
    const completed = patient.treatments.reduce((acc, t) => acc + t.completedSessions, 0);
    return { completed, total };
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
