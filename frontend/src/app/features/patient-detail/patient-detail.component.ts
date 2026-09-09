import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { AuthService } from '../../core/services/auth.service';
import { PermissionsService } from '../../core/services/permissions.service';
import { PillTabsComponent } from '../../shared/components/pill-tabs/pill-tabs.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { PaymentModalComponent, PaymentFormData } from '../../shared/components/payment-modal/payment-modal.component';
import { CurrencyCopPipe } from '../../shared/pipes/currency-cop.pipe';
import { WorkflowDiagramComponent } from '../../shared/components/workflow-diagram/workflow-diagram.component';
import { Patient, TreatmentCategory, ClinicalSession } from '../../core/models/patient.model';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PillTabsComponent,
    ProgressBarComponent,
    PaymentModalComponent,
    CurrencyCopPipe,
    WorkflowDiagramComponent,
  ],
  template: `
    @if (patient(); as p) {
      <div class="animate-fade-in space-y-6 w-full">

        <!-- Back Button & Breadcrumb -->
        <div class="flex items-center justify-between">
          <button (click)="goBack()" class="btn-ghost -ml-2 text-xs font-semibold">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Volver a Pacientes
          </button>

          <span class="text-xs text-zinc-400 font-medium">Expediente ID: {{ p.id }}</span>
        </div>

        <!-- ═════════════════════════════════════════════════════════ -->
        <!-- HEADER: Resumen del Paciente                              -->
        <!-- ═════════════════════════════════════════════════════════ -->
        <section class="card p-6 bg-white border border-zinc-200/90 shadow-sm rounded-2xl">
          <div class="flex flex-col sm:flex-row items-start gap-5">
            <div class="w-16 h-16 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-xs">
              {{ p.firstName.charAt(0) }}{{ p.lastName.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
                  {{ p.firstName }} {{ p.lastName }}
                </h1>
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700">
                  Ingreso: {{ p.createdAt }}
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2.5 text-xs text-zinc-500">
                <span class="flex items-center gap-1.5 font-medium">
                  <svg class="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                  </svg>
                  CC: {{ p.documentId }}
                </span>
                <span class="flex items-center gap-1.5 font-medium">
                  <svg class="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  {{ p.phone }}
                </span>
                <span class="flex items-center gap-1.5 font-medium">
                  <svg class="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  {{ p.email }}
                </span>
              </div>
            </div>

            <div class="text-right flex-shrink-0 self-start sm:self-center">
              <span class="micro-label">Especialista Asignado</span>
              <p class="text-sm font-bold text-zinc-900 mt-0.5">{{ getSpecialistName(p.assignedSpecialistId) }}</p>
            </div>
          </div>
        </section>

        <!-- ═════════════════════════════════════════════════════════ -->
        <!-- SECCIÓN 1 (VISIBLE): Diagrama Clínico de Flujo (Workflow) -->
        <!-- ═════════════════════════════════════════════════════════ -->
        <section>
          <app-workflow-diagram [patient]="p" />
        </section>

        <!-- ═════════════════════════════════════════════════════════ -->
        <!-- SECCIÓN 2 (VISIBLE): Estado de Cuenta (Gerente & Admin)   -->
        <!-- ═════════════════════════════════════════════════════════ -->
        @if (permissions.canViewFinancials()) {
          <section class="card p-6 bg-white border border-zinc-200/90 shadow-sm rounded-2xl">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-base sm:text-lg font-bold text-zinc-900">Estado de Cuenta & Cartera</h2>
                <p class="text-xs text-zinc-400">Balance financiero del plan terapéutico</p>
              </div>
              @if (permissions.canRegisterPayment()) {
                <button (click)="showPaymentModal.set(true)" class="btn-primary text-xs px-4 py-2">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Registrar Abono
                </button>
              }
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="bg-zinc-50 border border-zinc-200/70 rounded-xl px-4 py-3.5">
                <span class="text-xs font-bold uppercase tracking-wider text-zinc-400">Costo Total</span>
                <p class="text-xl font-bold tracking-tight text-zinc-900 my-0.5">{{ accountBalance().totalCost | currencyCop }}</p>
                <p class="text-[11px] text-zinc-400">Valor de tratamientos formulados</p>
              </div>

              <div class="bg-zinc-50 border border-zinc-200/70 rounded-xl px-4 py-3.5">
                <span class="text-xs font-bold uppercase tracking-wider text-zinc-400">Abonos Realizados</span>
                <p class="text-xl font-bold tracking-tight text-emerald-600 my-0.5">{{ accountBalance().totalPaid | currencyCop }}</p>
                <p class="text-[11px] text-zinc-400">Recaudado en caja</p>
              </div>

              <div class="rounded-xl px-4 py-3.5 border" [ngClass]="accountBalance().pendingBalance > 0 ? 'bg-rose-50 border-rose-200' : 'bg-zinc-50 border-zinc-200/70'">
                <span class="text-xs font-bold uppercase tracking-wider text-zinc-400">Saldo Pendiente</span>
                <div class="flex items-center gap-2 my-0.5">
                  <p class="text-xl font-bold tracking-tight" [ngClass]="accountBalance().pendingBalance > 0 ? 'text-rose-600' : 'text-zinc-900'">
                    {{ accountBalance().pendingBalance | currencyCop }}
                  </p>
                  @if (accountBalance().pendingBalance > 0) {
                    <span class="badge-pending text-[10px]">Por Cobrar</span>
                  } @else {
                    <span class="badge-completed text-[10px]">Al día</span>
                  }
                </div>
                <p class="text-[11px] text-zinc-400">Cuentas por cobrar</p>
              </div>
            </div>
          </section>
        }

        <!-- ═════════════════════════════════════════════════════════ -->
        <!-- SECCIÓN 3 (VISIBLE): Tratamientos del Paciente            -->
        <!-- ═════════════════════════════════════════════════════════ -->
        <section class="card p-6 bg-white border border-zinc-200/90 shadow-sm rounded-2xl space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base sm:text-lg font-bold text-zinc-900">Tratamientos Formulados</h2>
              <p class="text-xs text-zinc-400">Sesiones programadas y avance individual</p>
            </div>
          </div>

          <!-- Pill tabs: only show if user can see BOTH categories -->
          @if (availableTabs().length > 1) {
            <div>
              <app-pill-tabs
                [tabs]="availableTabs()"
                [activeTab]="activeCategory()"
                (tabChange)="activeCategory.set($event)"
              />
            </div>
          }

          <div class="space-y-3 pt-1">
            @for (treatment of filteredTreatments(); track treatment.id) {
              <div class="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl space-y-3">
                <div class="flex items-start justify-between">
                  <div class="min-w-0 flex-1 mr-4">
                    <h3 class="text-sm font-bold text-zinc-900">{{ treatment.name }}</h3>
                    <p class="text-xs text-zinc-400 mt-0.5">
                      {{ treatment.category === 'corporal-cosmetologia' ? 'Corporal / Cosmetología' : 'Procedimiento Médico Especializado' }}
                    </p>
                  </div>
                  <span
                    [ngClass]="treatment.status === 'active' ? 'badge-active' :
                               treatment.status === 'completed' ? 'badge-completed' : 'badge-paused'"
                  >
                    {{ treatment.status === 'active' ? 'En Curso' :
                       treatment.status === 'completed' ? 'Completado' : 'Pausado' }}
                  </span>
                </div>

                <app-progress-bar
                  [current]="treatment.completedSessions"
                  [total]="treatment.totalSessions"
                />

                <!-- Treatment Financials — Gerente + Administradora only -->
                @if (permissions.canViewFinancials()) {
                  <div class="flex items-center gap-6 pt-2.5 border-t border-zinc-200/60 text-xs">
                    <div>
                      <span class="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Costo</span>
                      <p class="font-bold text-zinc-800">{{ treatment.totalCost | currencyCop }}</p>
                    </div>
                    <div>
                      <span class="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Pagado</span>
                      <p class="font-bold text-emerald-600">{{ treatment.totalPaid | currencyCop }}</p>
                    </div>
                    @if (treatment.totalCost - treatment.totalPaid > 0) {
                      <div>
                        <span class="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Pendiente</span>
                        <p class="font-bold text-rose-500">{{ treatment.totalCost - treatment.totalPaid | currencyCop }}</p>
                      </div>
                    }
                  </div>
                }
              </div>
            }

            @if (filteredTreatments().length === 0) {
              <div class="text-center py-8">
                <p class="text-xs text-zinc-400">No hay tratamientos registrados en esta categoría</p>
              </div>
            }
          </div>
        </section>

        <!-- ═════════════════════════════════════════════════════════ -->
        <!-- SECCIÓN 4 (COLAPSIBLE): Historial de Evolución Clínica    -->
        <!-- ═════════════════════════════════════════════════════════ -->
        <section class="card bg-white border border-zinc-200/90 shadow-sm rounded-2xl overflow-hidden">
          <!-- Toggle Button Header -->
          <button
            type="button"
            (click)="toggleEvolutionHistory()"
            class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-zinc-50/60 transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div>
                <h3 class="text-sm sm:text-base font-bold text-zinc-900">Historial de Evolución Clínica</h3>
                <p class="text-xs text-zinc-400">Notas de sesión, observaciones médicas y respuesta del paciente</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700">
                {{ visibleHistory().length }} notas registradas
              </span>
              <div
                class="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 transition-transform duration-300"
                [class.rotate-180]="showEvolutionHistory()"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </button>

          <!-- Collapsible Content -->
          @if (showEvolutionHistory()) {
            <div class="px-6 pb-6 pt-2 border-t border-zinc-100 animate-fade-in">
              <div class="relative mt-4">
                <div class="absolute left-5 top-0 bottom-0 w-px bg-zinc-200"></div>

                <div class="space-y-4">
                  @for (session of visibleHistory(); track session.id) {
                    <div class="relative flex gap-4">
                      <div class="relative z-10 w-10 h-10 rounded-full bg-white border-2 border-zinc-300 flex items-center justify-center flex-shrink-0 shadow-xs">
                        <span class="text-xs font-bold text-zinc-700">S{{ session.sessionNumber }}</span>
                      </div>
                      <div class="card flex-1 p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                          <span class="text-xs font-bold text-zinc-900">{{ session.treatmentName }}</span>
                          <span class="text-xs text-zinc-400 font-medium">{{ session.date | date:'d MMM yyyy' }}</span>
                        </div>
                        <p class="text-xs text-zinc-600 leading-relaxed font-normal">"{{ session.notes }}"</p>
                        <p class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-2.5">
                          Atendido por: {{ session.specialistName }}
                        </p>
                      </div>
                    </div>
                  }

                  @if (visibleHistory().length === 0) {
                    <div class="text-center py-8 ml-14">
                      <p class="text-xs text-zinc-400">Sin notas de evolución aún en esta categoría</p>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </section>

        <!-- ═════════════════════════════════════════════════════════ -->
        <!-- SECCIÓN 5 (COLAPSIBLE): Registrar Nueva Evolución         -->
        <!-- ═════════════════════════════════════════════════════════ -->
        @if (permissions.canRegisterEvolution()) {
          <section class="card bg-white border border-zinc-200/90 shadow-sm rounded-2xl overflow-hidden">
            <!-- Toggle Button Header -->
            <button
              type="button"
              (click)="toggleRegisterEvolution()"
              class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-zinc-50/60 transition-colors cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-sm sm:text-base font-bold text-zinc-900">Registrar Nueva Evolución Clínica</h3>
                  <p class="text-xs text-zinc-400">Añadir nota de sesión y actualización de tratamiento</p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold text-zinc-500">
                  {{ showRegisterEvolution() ? 'Cerrar Formulario' : 'Abrir Formulario' }}
                </span>
                <div
                  class="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 transition-transform duration-300"
                  [class.rotate-180]="showRegisterEvolution()"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </button>

            <!-- Collapsible Form -->
            @if (showRegisterEvolution()) {
              <div class="px-6 pb-6 pt-4 border-t border-zinc-100 bg-zinc-50/40 animate-fade-in">
                <form (ngSubmit)="submitEvolution()" class="space-y-4 max-w-2xl">
                  <div>
                    <label class="label">Tratamiento Correspondiente</label>
                    <select
                      [(ngModel)]="newEvolutionTreatmentId"
                      name="treatmentId"
                      class="input-premium text-xs"
                      required
                    >
                      @for (t of visibleTreatments(); track t.id) {
                        <option [value]="t.id">{{ t.name }} (Sesión {{ t.completedSessions + 1 }}/{{ t.totalSessions }})</option>
                      }
                    </select>
                  </div>

                  <div>
                    <label class="label">Observaciones & Evolución Clínica</label>
                    <textarea
                      [(ngModel)]="newEvolutionNotes"
                      name="notes"
                      rows="3"
                      class="input-premium text-xs"
                      placeholder="Describe la respuesta del tejido, cambios en medidas, tolerancia y recomendaciones..."
                      required
                    ></textarea>
                  </div>

                  <div class="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      class="btn-primary text-xs px-5 py-2.5"
                      [disabled]="!newEvolutionNotes.trim() || !newEvolutionTreatmentId"
                    >
                      Guardar Nota Clínica
                    </button>
                    <button
                      type="button"
                      (click)="showRegisterEvolution.set(false)"
                      class="btn-ghost text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            }
          </section>
        }

        <!-- ═════════════════════════════════════════════════════════ -->
        <!-- SECCIÓN 6 (COLAPSIBLE): Historial de Pagos & Recibos      -->
        <!-- ═════════════════════════════════════════════════════════ -->
        @if (permissions.canViewFinancials()) {
          <section class="card bg-white border border-zinc-200/90 shadow-sm rounded-2xl overflow-hidden">
            <!-- Toggle Button Header -->
            <button
              type="button"
              (click)="togglePaymentsHistory()"
              class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-zinc-50/60 transition-colors cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-sm sm:text-base font-bold text-zinc-900">Historial de Pagos & Recibos Emitidos</h3>
                  <p class="text-xs text-zinc-400">Detalle de abonos, fecha y método de pago registrado</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700">
                  {{ patientPayments().length }} recibos
                </span>
                <div
                  class="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 transition-transform duration-300"
                  [class.rotate-180]="showPaymentsHistory()"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </button>

            <!-- Collapsible Table -->
            @if (showPaymentsHistory()) {
              <div class="px-6 pb-6 pt-2 border-t border-zinc-100 animate-fade-in">
                <div class="overflow-x-auto">
                  <table class="w-full text-xs text-left">
                    <thead>
                      <tr class="border-b border-zinc-200/80 text-[10.5px] font-bold uppercase tracking-wider text-zinc-400">
                        <th class="py-3 pr-4">Recibo ID</th>
                        <th class="py-3 px-4">Fecha</th>
                        <th class="py-3 px-4">Método</th>
                        <th class="py-3 px-4">Registrado por</th>
                        <th class="py-3 pl-4 text-right">Monto Abonado</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-100">
                      @for (pay of patientPayments(); track pay.id) {
                        <tr class="hover:bg-zinc-50/60 transition-colors">
                          <td class="py-3 pr-4 font-bold text-zinc-900">{{ pay.id }}</td>
                          <td class="py-3 px-4 text-zinc-600">{{ pay.date | date:'d MMM yyyy' }}</td>
                          <td class="py-3 px-4">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-zinc-100 text-zinc-700">
                              {{ pay.method }}
                            </span>
                          </td>
                          <td class="py-3 px-4 text-zinc-500">{{ pay.registeredBy }}</td>
                          <td class="py-3 pl-4 text-right font-bold text-emerald-600">{{ pay.amount | currencyCop }}</td>
                        </tr>
                      }
                      @if (patientPayments().length === 0) {
                        <tr>
                          <td colspan="5" class="py-6 text-center text-zinc-400">No hay pagos registrados para este paciente</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }
          </section>
        }

      </div>

      <!-- Payment Modal -->
      @if (showPaymentModal()) {
        <app-payment-modal
          [patientName]="p.firstName + ' ' + p.lastName"
          [treatments]="p.treatments"
          (modalClose)="showPaymentModal.set(false)"
          (paymentSubmit)="onPaymentSubmit($event)"
        />
      }
    } @else {
      <!-- Patient Not Found -->
      <div class="text-center py-20 animate-fade-in">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-100 mb-4">
          <svg class="w-8 h-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
          </svg>
        </div>
        <p class="text-lg font-bold text-zinc-900">Paciente no encontrado</p>
        <p class="text-sm text-zinc-400 mt-1 mb-6">El paciente solicitado no existe o fue eliminado.</p>
        <button (click)="goBack()" class="btn-primary">Volver al Directorio</button>
      </div>
    }
  `,
})
export class PatientDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataService = inject(MockDataService);
  private readonly authService = inject(AuthService);
  readonly permissions = inject(PermissionsService);

  readonly patient = signal<Patient | undefined>(undefined);
  readonly showPaymentModal = signal(false);
  readonly activeCategory = signal<string>('');

  // Collapsible Accordion States (hidden by default, revealed on click)
  readonly showEvolutionHistory = signal(false);
  readonly showRegisterEvolution = signal(false);
  readonly showPaymentsHistory = signal(false);

  // New evolution form fields
  newEvolutionTreatmentId = '';
  newEvolutionNotes = '';

  private readonly TAB_LABELS: Record<string, TreatmentCategory> = {
    'Corporal / Cosmetología': 'corporal-cosmetologia',
    'Procedimientos Médicos': 'medico-no-invasivo',
  };

  private readonly CATEGORY_TO_TAB: Record<TreatmentCategory, string> = {
    'corporal-cosmetologia': 'Corporal / Cosmetología',
    'medico-no-invasivo': 'Procedimientos Médicos',
  };

  readonly availableTabs = computed(() => {
    const allowed = this.permissions.visibleTreatmentCategories();
    return allowed.map(cat => this.CATEGORY_TO_TAB[cat]);
  });

  readonly visibleTreatments = computed(() => {
    const p = this.patient();
    if (!p) return [];
    const allowed = this.permissions.visibleTreatmentCategories();
    return p.treatments.filter(t => allowed.includes(t.category));
  });

  readonly filteredTreatments = computed(() => {
    const active = this.activeCategory();
    const category = this.TAB_LABELS[active];
    if (!category) return this.visibleTreatments();
    return this.visibleTreatments().filter(t => t.category === category);
  });

  readonly accountBalance = computed(() => {
    const p = this.patient();
    if (!p) return { totalCost: 0, totalPaid: 0, pendingBalance: 0 };
    return this.dataService.getAccountBalance(p.id);
  });

  readonly patientPayments = computed(() => {
    const p = this.patient();
    if (!p) return [];
    return this.dataService.getPaymentsByPatient(p.id);
  });

  readonly visibleHistory = computed(() => {
    const p = this.patient();
    if (!p) return [];
    const allowed = this.permissions.visibleTreatmentCategories();
    const treatmentCategoryMap = new Map(p.treatments.map(t => [t.id, t.category]));
    return p.clinicalHistory.filter(session => {
      const cat = treatmentCategoryMap.get(session.treatmentId);
      return cat ? allowed.includes(cat) : true;
    });
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.patient.set(this.dataService.getPatientById(id));
    }

    const tabs = this.availableTabs();
    if (tabs.length > 0) {
      this.activeCategory.set(tabs[0]);
    }

    const treatments = this.visibleTreatments();
    if (treatments.length > 0) {
      this.newEvolutionTreatmentId = treatments[0].id;
    }
  }

  getSpecialistName(specialistId: string): string {
    if (specialistId === 'usr-003') return 'Dr. Andrés Castaño';
    if (specialistId === 'usr-004') return 'Camila Herrera';
    return 'Especialista Asignado';
  }

  submitEvolution(): void {
    const p = this.patient();
    if (!p || !this.newEvolutionTreatmentId || !this.newEvolutionNotes.trim()) return;

    const treatment = p.treatments.find(t => t.id === this.newEvolutionTreatmentId);
    const sessionNumber = (treatment?.completedSessions || 0) + 1;

    this.dataService.addClinicalEvolution(p.id, {
      treatmentId: this.newEvolutionTreatmentId,
      treatmentName: treatment?.name || 'Tratamiento',
      sessionNumber,
      date: new Date().toISOString().split('T')[0],
      notes: this.newEvolutionNotes.trim(),
      specialistName: this.authService.currentUser()?.name || 'Especialista',
      specialistId: this.authService.currentUser()?.id || '',
    });

    // Refresh patient and reset form
    this.patient.set(this.dataService.getPatientById(p.id));
    this.newEvolutionNotes = '';
    this.showRegisterEvolution.set(false);
    this.showEvolutionHistory.set(true); // Open history so user sees the newly added evolution
  }

  onPaymentSubmit(data: PaymentFormData): void {
    const p = this.patient();
    if (!p) return;

    this.dataService.addPayment({
      patientId: p.id,
      treatmentId: data.treatmentId,
      amount: data.amount,
      method: data.method,
      date: new Date().toISOString().split('T')[0],
      registeredBy: this.authService.currentUser()?.name || 'Sistema',
      notes: data.notes,
    });

    this.patient.set(this.dataService.getPatientById(p.id));
  }

  goBack(): void {
    this.router.navigate(['/pacientes']);
  }

  toggleEvolutionHistory(): void {
    this.showEvolutionHistory.update(v => !v);
  }

  toggleRegisterEvolution(): void {
    this.showRegisterEvolution.update(v => !v);
  }

  togglePaymentsHistory(): void {
    this.showPaymentsHistory.update(v => !v);
  }
}
