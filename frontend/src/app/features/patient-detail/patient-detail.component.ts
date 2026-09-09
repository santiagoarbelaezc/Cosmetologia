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
import { Patient, TreatmentCategory, ClinicalSession, MedicalRecord } from '../../core/models/patient.model';

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

        @if (permissions.canViewFinancials()) {
          <!-- ═════════════════════════════════════════════════════════ -->
          <!-- VISTA GERENTE & ADMINISTRADORA                            -->
          <!-- 1. Diagrama Clínico de Flujo (Visible arriba)             -->
          <!-- 2. Estado de Cuenta & Cartera (Arriba)                    -->
          <!-- 3. Tratamientos y Avance (con Costos y Abonos)            -->
          <!-- 4. Historia del Paciente (Modo Lectura)                   -->
          <!-- 5. Historial de Procedimientos (Modo Lectura)             -->
          <!-- ═════════════════════════════════════════════════════════ -->

          <!-- 1. DIAGRAMA CLÍNICO (VISIBLE ARRIBA) -->
          <section class="card p-6 bg-white border border-zinc-200/90 shadow-sm rounded-2xl space-y-4">
            <div class="flex items-center gap-3 border-b border-zinc-100 pb-3">
              <div class="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                </svg>
              </div>
              <div>
                <h3 class="text-base font-bold text-zinc-900">Diagrama Clínico de Flujo</h3>
                <p class="text-xs text-zinc-400">Progreso general por etapas del paciente</p>
              </div>
            </div>
            <app-workflow-diagram [patient]="p" />
          </section>

          <!-- 2. ESTADO DE CUENTA & CARTERA (ARRIBA) -->
          <section class="card p-6 bg-white border border-zinc-200/90 shadow-sm rounded-2xl space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-bold text-zinc-900">Estado de Cuenta & Cartera</h3>
                <p class="text-xs text-zinc-400">Balance financiero y cuentas por cobrar</p>
              </div>
              @if (permissions.canRegisterPayment()) {
                <button (click)="showPaymentModal.set(true)" class="btn-primary text-xs px-3.5 py-2 cursor-pointer shadow-xs">
                  Registrar Abono
                </button>
              }
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="bg-zinc-50 border border-zinc-200/70 rounded-xl px-4 py-3">
                <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Costo Total</span>
                <p class="text-lg font-bold text-zinc-900 mt-0.5">{{ accountBalance().totalCost | currencyCop }}</p>
              </div>
              <div class="bg-zinc-50 border border-zinc-200/70 rounded-xl px-4 py-3">
                <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Abonos</span>
                <p class="text-lg font-bold text-emerald-600 mt-0.5">{{ accountBalance().totalPaid | currencyCop }}</p>
              </div>
              <div class="rounded-xl px-4 py-3 border" [ngClass]="accountBalance().pendingBalance > 0 ? 'bg-rose-50 border-rose-200' : 'bg-zinc-50 border-zinc-200/70'">
                <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Pendiente</span>
                <p class="text-lg font-bold mt-0.5" [ngClass]="accountBalance().pendingBalance > 0 ? 'text-rose-600' : 'text-zinc-900'">
                  {{ accountBalance().pendingBalance | currencyCop }}
                </p>
              </div>
            </div>

            @if (patientPayments().length > 0) {
              <div class="pt-3 border-t border-zinc-100">
                <h4 class="text-xs font-bold text-zinc-700 mb-2">Recibos Emitidos</h4>
                <div class="space-y-1.5">
                  @for (pay of patientPayments(); track pay.id) {
                    <div class="flex items-center justify-between text-xs p-2.5 bg-zinc-50 rounded-lg">
                      <span class="font-bold text-zinc-800">{{ pay.id }} · {{ pay.method }}</span>
                      <span class="text-zinc-400">{{ pay.date | date:'d MMM yyyy' }}</span>
                      <span class="font-bold text-emerald-600">{{ pay.amount | currencyCop }}</span>
                    </div>
                  }
                </div>
              </div>
            }
          </section>

          <!-- 3. TRATAMIENTOS DEL PACIENTE (CON COSTOS Y ABONOS) -->
          <section class="card p-6 bg-white border border-zinc-200/90 shadow-sm rounded-2xl space-y-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h3 class="text-base font-bold text-zinc-900">Tratamientos del Paciente</h3>
                <p class="text-xs text-zinc-400">Avance de sesiones y desglose económico</p>
              </div>
            </div>

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
                <div class="p-3.5 bg-zinc-50 border border-zinc-200/70 rounded-xl space-y-2.5">
                  <div class="flex items-start justify-between">
                    <div class="min-w-0 flex-1 mr-3">
                      <h4 class="text-xs sm:text-sm font-bold text-zinc-900">{{ treatment.name }}</h4>
                      <p class="text-[11px] text-zinc-400 mt-0.5">
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

                  <div class="flex items-center gap-6 pt-2 border-t border-zinc-200/60 text-xs">
                    <div>
                      <span class="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Costo</span>
                      <p class="font-bold text-zinc-800">{{ treatment.totalCost | currencyCop }}</p>
                    </div>
                    <div>
                      <span class="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Pagado</span>
                      <p class="font-bold text-emerald-600">{{ treatment.totalPaid | currencyCop }}</p>
                    </div>
                  </div>
                </div>
              }

              @if (filteredTreatments().length === 0) {
                <div class="text-center py-6">
                  <p class="text-xs text-zinc-400">No hay tratamientos en esta categoría</p>
                </div>
              }
            </div>
          </section>

          <!-- 4. HISTORIA DEL PACIENTE (CONSULTA / SOLO LECTURA) -->
          <section class="card bg-white border border-zinc-200/90 shadow-sm rounded-2xl overflow-hidden">
            <div class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-sm sm:text-base font-bold text-zinc-900">Historia del Paciente</h3>
                  <p class="text-xs text-zinc-400">Anamnesis y diagnóstico dérmico (solo lectura)</p>
                </div>
              </div>
            </div>

            @if (p.medicalRecord; as rec) {
              <div class="p-5 space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div class="p-3 bg-zinc-50 border border-zinc-200/70 rounded-xl space-y-0.5">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Motivo de Consulta</span>
                    <p class="text-xs font-semibold text-zinc-900 leading-snug">{{ rec.motivoConsulta }}</p>
                  </div>
                  <div class="p-3 bg-zinc-50 border border-zinc-200/70 rounded-xl space-y-0.5">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Diagnóstico Dérmico / Estético</span>
                    <p class="text-xs font-semibold text-zinc-900 leading-snug">{{ rec.diagnosticoEstetico }}</p>
                  </div>
                  <div class="p-3 border rounded-xl space-y-0.5" [ngClass]="rec.alergias.toLowerCase().includes('alergia') || !rec.alergias.toLowerCase().includes('niega') ? 'bg-amber-50/70 border-amber-200' : 'bg-zinc-50 border-zinc-200/70'">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Alergias</span>
                    <p class="text-xs font-semibold leading-snug text-zinc-800">{{ rec.alergias }}</p>
                  </div>
                  <div class="p-3 bg-zinc-50 border border-zinc-200/70 rounded-xl space-y-0.5">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Antecedentes Clínicos</span>
                    <p class="text-xs text-zinc-700 leading-snug">{{ rec.antecedentesMedicos }}</p>
                  </div>
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-zinc-100 text-[11px] text-zinc-400">
                  <span>Registrado por: <strong class="text-zinc-700">{{ rec.registradoPor }}</strong></span>
                  <span>{{ rec.fechaRegistro | date:'d MMM yyyy' }}</span>
                </div>
              </div>
            } @else {
              <div class="p-6 text-center">
                <p class="text-xs text-zinc-400">Sin historia médica registrada aún.</p>
              </div>
            }
          </section>

          <!-- 5. HISTORIAL DE PROCEDIMIENTOS (CONSULTA / SOLO LECTURA) -->
          <section class="card p-6 bg-white border border-zinc-200/90 shadow-sm rounded-2xl space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-bold text-zinc-900">Historial de Procedimientos Realizados</h3>
                <p class="text-xs text-zinc-400">Registro clínico de sesiones aplicadas</p>
              </div>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700">
                {{ visibleHistory().length }} procedimientos
              </span>
            </div>

            <div class="space-y-3">
              @for (session of visibleHistory(); track session.id) {
                <div class="p-3.5 bg-zinc-50 border border-zinc-200/70 rounded-xl space-y-1.5">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 rounded-md bg-zinc-900 text-white font-bold text-[10px] flex items-center justify-center">
                        S{{ session.sessionNumber }}
                      </span>
                      <h4 class="text-xs font-bold text-zinc-900">{{ session.treatmentName }}</h4>
                    </div>
                    <span class="text-xs text-zinc-400 font-medium">{{ session.date | date:'d MMM yyyy' }}</span>
                  </div>
                  <p class="text-xs text-zinc-600 pl-8">"{{ session.notes }}"</p>
                  <p class="text-[10px] text-zinc-400 pl-8 font-medium">Atendido por: {{ session.specialistName }}</p>
                </div>
              }

              @if (visibleHistory().length === 0) {
                <div class="text-center py-6">
                  <p class="text-xs text-zinc-400">No hay procedimientos realizados aún.</p>
                </div>
              }
            </div>
          </section>

        } @else {

          <!-- ═════════════════════════════════════════════════════════ -->
          <!-- VISTA MÉDICO / COSMETÓLOGA                                -->
          <!-- 1. Diagrama Clínico de Flujo (Oculto por defecto)         -->
          <!-- 2. Historia del Paciente                                  -->
          <!-- 3. Historial de Procedimientos (+ Añadir Debajo)          -->
          <!-- 4. Historial de Tratamientos (Recetar Tratamiento)        -->
          <!-- (Estado de Cuenta totalmente Oculto)                      -->
          <!-- ═════════════════════════════════════════════════════════ -->

          <!-- 1. DIAGRAMA CLÍNICO DE FLUJO (OCULTO POR DEFECTO) -->
          <section class="card bg-white border border-zinc-200/90 shadow-sm rounded-2xl overflow-hidden">
            <button
              type="button"
              (click)="toggleWorkflowDiagram()"
              class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-zinc-50/60 transition-colors cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-sm sm:text-base font-bold text-zinc-900">Diagrama Clínico de Flujo</h3>
                  <p class="text-xs text-zinc-400">Progreso por etapas del paciente</p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold text-zinc-500">
                  {{ showWorkflowDiagram() ? 'Ocultar Diagrama' : 'Ver Diagrama' }}
                </span>
                <div
                  class="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 transition-transform duration-300"
                  [class.rotate-180]="showWorkflowDiagram()"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </button>

            @if (showWorkflowDiagram()) {
              <div class="p-6 border-t border-zinc-100 animate-fade-in">
                <app-workflow-diagram [patient]="p" />
              </div>
            }
          </section>

          <!-- 2. HISTORIA DEL PACIENTE (FICHA MÉDICA & ANAMNESIS) -->
          <section class="card bg-white border border-zinc-200/90 shadow-sm rounded-2xl overflow-hidden">
            <div class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-sm sm:text-base font-bold text-zinc-900">Historia del Paciente</h3>
                  <p class="text-xs text-zinc-400">Anamnesis, diagnóstico y antecedentes estéticos</p>
                </div>
              </div>

              @if (permissions.canCreateMedicalRecord()) {
                <button
                  type="button"
                  (click)="openMedicalRecordModal()"
                  class="btn-secondary text-xs px-3.5 py-1.5 cursor-pointer"
                >
                  {{ p.medicalRecord ? 'Editar Historia' : 'Crear Historia' }}
                </button>
              }
            </div>

            @if (p.medicalRecord; as rec) {
              <div class="p-5 space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div class="p-3 bg-zinc-50 border border-zinc-200/70 rounded-xl space-y-0.5">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Motivo de Consulta</span>
                    <p class="text-xs font-semibold text-zinc-900 leading-snug">{{ rec.motivoConsulta }}</p>
                  </div>

                  <div class="p-3 bg-zinc-50 border border-zinc-200/70 rounded-xl space-y-0.5">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Diagnóstico Dérmico / Estético</span>
                    <p class="text-xs font-semibold text-zinc-900 leading-snug">{{ rec.diagnosticoEstetico }}</p>
                  </div>

                  <div class="p-3 border rounded-xl space-y-0.5" [ngClass]="rec.alergias.toLowerCase().includes('alergia') || !rec.alergias.toLowerCase().includes('niega') ? 'bg-amber-50/70 border-amber-200' : 'bg-zinc-50 border-zinc-200/70'">
                    <div class="flex items-center gap-1.5">
                      <span class="text-[10px] font-bold uppercase tracking-wider" [ngClass]="rec.alergias.toLowerCase().includes('alergia') || !rec.alergias.toLowerCase().includes('niega') ? 'text-amber-700' : 'text-zinc-400'">Alergias</span>
                      @if (rec.alergias.toLowerCase().includes('alergia') || !rec.alergias.toLowerCase().includes('niega')) {
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      }
                    </div>
                    <p class="text-xs font-semibold leading-snug" [ngClass]="rec.alergias.toLowerCase().includes('alergia') || !rec.alergias.toLowerCase().includes('niega') ? 'text-amber-900' : 'text-zinc-800'">{{ rec.alergias }}</p>
                  </div>

                  <div class="p-3 bg-zinc-50 border border-zinc-200/70 rounded-xl space-y-0.5">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Antecedentes Clínicos</span>
                    <p class="text-xs text-zinc-700 leading-snug">{{ rec.antecedentesMedicos }}</p>
                  </div>
                </div>

                <div class="flex items-center justify-between pt-2 border-t border-zinc-100 text-[11px] text-zinc-400">
                  <span>Registrado por: <strong class="text-zinc-700">{{ rec.registradoPor }}</strong></span>
                  <span>{{ rec.fechaRegistro | date:'d MMM yyyy' }}</span>
                </div>
              </div>
            } @else {
              <div class="p-6 text-center space-y-2">
                <p class="text-xs text-zinc-500">Sin historia médica registrada para este paciente.</p>
                @if (permissions.canCreateMedicalRecord()) {
                  <button
                    type="button"
                    (click)="openMedicalRecordModal()"
                    class="btn-primary text-xs px-3.5 py-1.5 cursor-pointer"
                  >
                    Crear Historia Clínica
                  </button>
                }
              </div>
            }
          </section>

          <!-- 3. HISTORIAL DE PROCEDIMIENTOS REALIZADOS (+ AÑADIR DEBAJO) -->
          <section class="card p-6 bg-white border border-zinc-200/90 shadow-sm rounded-2xl space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-bold text-zinc-900">Historial de Procedimientos Realizados</h3>
                <p class="text-xs text-zinc-400">Notas clínicas de evolución y sesiones efectuadas</p>
              </div>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700">
                {{ visibleHistory().length }} procedimientos
              </span>
            </div>

            <!-- Lista de Procedimientos -->
            <div class="space-y-3">
              @for (session of visibleHistory(); track session.id) {
                <div class="p-3.5 bg-zinc-50 border border-zinc-200/70 rounded-xl space-y-1.5">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 rounded-md bg-zinc-900 text-white font-bold text-[10px] flex items-center justify-center">
                        S{{ session.sessionNumber }}
                      </span>
                      <h4 class="text-xs font-bold text-zinc-900">{{ session.treatmentName }}</h4>
                    </div>
                    <span class="text-xs text-zinc-400 font-medium">{{ session.date | date:'d MMM yyyy' }}</span>
                  </div>
                  <p class="text-xs text-zinc-600 pl-8">"{{ session.notes }}"</p>
                  <p class="text-[10px] text-zinc-400 pl-8 font-medium">Atendido por: {{ session.specialistName }}</p>
                </div>
              }

              @if (visibleHistory().length === 0) {
                <div class="text-center py-6">
                  <p class="text-xs text-zinc-400">No hay procedimientos realizados aún.</p>
                </div>
              }
            </div>

            <!-- Añadir Nuevo Procedimiento Debajo -->
            @if (permissions.canRegisterEvolution()) {
              <div class="pt-3 border-t border-zinc-100">
                @if (!showAddProcedure()) {
                  <button
                    type="button"
                    (click)="toggleAddProcedure()"
                    class="btn-secondary text-xs flex items-center gap-1.5 px-3.5 py-2 cursor-pointer shadow-xs"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>Añadir Nuevo Procedimiento</span>
                  </button>
                } @else {
                  <div class="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-3 animate-fade-in">
                    <div class="flex items-center justify-between">
                      <h4 class="text-xs font-bold text-zinc-900">Registrar Procedimiento Realizado</h4>
                      <button type="button" (click)="toggleAddProcedure()" class="text-xs text-zinc-400 hover:text-zinc-700 cursor-pointer">✕ Cancelar</button>
                    </div>

                    <form (ngSubmit)="submitProcedure()" class="space-y-3">
                      <div>
                        <label class="label text-xs">Tratamiento o Protocolo Correspondiente</label>
                        <select [(ngModel)]="newEvolutionTreatmentId" name="treatmentId" class="input-premium text-xs" required>
                          @for (t of visibleTreatments(); track t.id) {
                            <option [value]="t.id">{{ t.name }} (Sesión {{ t.completedSessions + 1 }}/{{ t.totalSessions }})</option>
                          }
                        </select>
                      </div>

                      <div>
                        <label class="label text-xs">Observaciones & Nota del Procedimiento</label>
                        <textarea
                          [(ngModel)]="newEvolutionNotes"
                          name="notes"
                          rows="2"
                          class="input-premium text-xs"
                          placeholder="Describe la respuesta dérmica, técnica aplicada y evolución..."
                          required
                        ></textarea>
                      </div>

                      <div class="flex items-center gap-2 pt-1">
                        <button
                          type="submit"
                          class="btn-primary text-xs px-4 py-2 cursor-pointer"
                          [disabled]="!newEvolutionNotes.trim() || !newEvolutionTreatmentId"
                        >
                          Guardar Procedimiento
                        </button>
                        <button type="button" (click)="toggleAddProcedure()" class="btn-ghost text-xs">
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                }
              </div>
            }
          </section>

          <!-- 4. HISTORIAL DE TRATAMIENTOS FORMULADOS (RECETAR) -->
          <section class="card p-6 bg-white border border-zinc-200/90 shadow-sm rounded-2xl space-y-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h3 class="text-base font-bold text-zinc-900">Historial de Tratamientos Formulados</h3>
                <p class="text-xs text-zinc-400">Planes activos, dosis e indicaciones médicas</p>
              </div>

              @if (permissions.canPrescribeTreatments()) {
                <button
                  type="button"
                  (click)="openPrescribeModal()"
                  class="btn-primary text-xs flex items-center gap-1.5 px-3.5 py-2 cursor-pointer shadow-xs"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span>Recetar Tratamiento</span>
                </button>
              }
            </div>

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
                <div class="p-3.5 bg-zinc-50 border border-zinc-200/70 rounded-xl space-y-2.5">
                  <div class="flex items-start justify-between">
                    <div class="min-w-0 flex-1 mr-3">
                      <h4 class="text-xs sm:text-sm font-bold text-zinc-900">{{ treatment.name }}</h4>
                      <p class="text-[11px] text-zinc-400 mt-0.5">
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

                  @if (treatment.dosage || treatment.prescriptionNotes) {
                    <div class="p-2.5 rounded-lg bg-white border border-zinc-200/60 text-xs text-zinc-600 space-y-0.5">
                      @if (treatment.dosage) {
                        <p><strong class="text-zinc-800 font-semibold">Cantidad / Dosis:</strong> {{ treatment.dosage }}</p>
                      }
                      @if (treatment.prescriptionNotes) {
                        <p><strong class="text-zinc-800 font-semibold">Indicaciones:</strong> {{ treatment.prescriptionNotes }}</p>
                      }
                    </div>
                  }
                </div>
              }

              @if (filteredTreatments().length === 0) {
                <div class="text-center py-6">
                  <p class="text-xs text-zinc-400">No hay tratamientos formulados en esta categoría</p>
                </div>
              }
            </div>
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

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- MODAL: Crear / Editar Historia Clínica Médica            -->
      <!-- ═════════════════════════════════════════════════════════ -->
      @if (showMedicalRecordModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div class="card w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 bg-white rounded-3xl shadow-2xl space-y-4 animate-slide-up">
            
            <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 class="text-base sm:text-lg font-bold text-zinc-900">
                  {{ p.medicalRecord ? 'Editar Historia Clínica' : 'Crear Historia Clínica' }}
                </h3>
                <p class="text-xs text-zinc-400">{{ p.firstName }} {{ p.lastName }}</p>
              </div>
              <button
                type="button"
                (click)="closeMedicalRecordModal()"
                class="w-7 h-7 rounded-full bg-zinc-100 text-zinc-500 hover:text-zinc-800 flex items-center justify-center cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <form (ngSubmit)="saveMedicalRecord()" class="space-y-3">
              <div>
                <label class="label text-xs">Motivo de Consulta *</label>
                <input
                  type="text"
                  [(ngModel)]="medicalRecordForm.motivoConsulta"
                  name="motivoConsulta"
                  class="input-premium text-xs"
                  placeholder="Ej: Desea atenuar arrugas en tercio superior..."
                  required
                />
              </div>

              <div>
                <label class="label text-xs">Diagnóstico Dérmico / Estético *</label>
                <input
                  type="text"
                  [(ngModel)]="medicalRecordForm.diagnosticoEstetico"
                  name="diagnosticoEstetico"
                  class="input-premium text-xs"
                  placeholder="Ej: Fotoenvejecimiento Glogau II, líneas dinámicas frontales..."
                  required
                />
              </div>

              <div>
                <label class="label text-xs">Alergias Identificadas *</label>
                <input
                  type="text"
                  [(ngModel)]="medicalRecordForm.alergias"
                  name="alergias"
                  class="input-premium text-xs"
                  placeholder="Ej: Alergia al polen / Niega alergias medicamentosas"
                  required
                />
              </div>

              <div>
                <label class="label text-xs">Antecedentes Médicos & Quirúrgicos *</label>
                <input
                  type="text"
                  [(ngModel)]="medicalRecordForm.antecedentesMedicos"
                  name="antecedentesMedicos"
                  class="input-premium text-xs"
                  placeholder="Ej: Sin antecedentes patológicos / Niega cirugías previas"
                  required
                />
              </div>

              <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  (click)="closeMedicalRecordModal()"
                  class="btn-ghost text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="btn-primary text-xs px-4 py-2 cursor-pointer"
                  [disabled]="!medicalRecordForm.motivoConsulta.trim() || !medicalRecordForm.diagnosticoEstetico.trim()"
                >
                  Guardar Historia
                </button>
              </div>
            </form>

          </div>
        </div>
      }

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- MODAL: Recetar Tratamiento (Medicamento, Cantidad, Notas)  -->
      <!-- ═════════════════════════════════════════════════════════ -->
      @if (showPrescribeModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div class="card w-full max-w-lg p-6 bg-white rounded-3xl shadow-2xl space-y-4 animate-slide-up">
            
            <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 class="text-base sm:text-lg font-bold text-zinc-900">Recetar Tratamiento</h3>
                <p class="text-xs text-zinc-400">{{ p.firstName }} {{ p.lastName }}</p>
              </div>
              <button
                type="button"
                (click)="closePrescribeModal()"
                class="w-7 h-7 rounded-full bg-zinc-100 text-zinc-500 hover:text-zinc-800 flex items-center justify-center cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <!-- Accesos Rápidos de Medicamento -->
            <div>
              <label class="label text-[10.5px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">
                Medicamentos & Procedimientos Frecuentes:
              </label>
              <div class="flex flex-wrap gap-1.5">
                @for (preset of prescriptionPresets; track preset.name) {
                  <button
                    type="button"
                    (click)="selectPrescriptionPreset(preset)"
                    class="px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
                    [ngClass]="prescribeForm.name === preset.name ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700'"
                  >
                    {{ preset.name }}
                  </button>
                }
              </div>
            </div>

            <!-- Formulario Simplificado -->
            <form (ngSubmit)="submitPrescription()" class="space-y-3.5 pt-1">
              <div>
                <label class="label text-xs">Medicamento o Tratamiento *</label>
                <input
                  type="text"
                  [(ngModel)]="prescribeForm.name"
                  name="name"
                  class="input-premium text-xs"
                  placeholder="Ej: Toxina Botulínica (Botox/Dysport)"
                  required
                />
              </div>

              <div>
                <label class="label text-xs">Cantidad / Dosis *</label>
                <input
                  type="text"
                  [(ngModel)]="prescribeForm.quantity"
                  name="quantity"
                  class="input-premium text-xs"
                  placeholder="Ej: 50 Unidades / 1 Jeringa (1ml) / 3 Sesiones"
                  required
                />
              </div>

              <div>
                <label class="label text-xs">Indicaciones del Médico / Receta *</label>
                <textarea
                  [(ngModel)]="prescribeForm.notes"
                  name="notes"
                  rows="2"
                  class="input-premium text-xs"
                  placeholder="Ej: Aplicar frío local las primeras 6h. No masajear la zona tratada..."
                  required
                ></textarea>
              </div>

              <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  (click)="closePrescribeModal()"
                  class="btn-ghost text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="btn-primary text-xs px-4 py-2 cursor-pointer shadow-xs"
                  [disabled]="!prescribeForm.name.trim() || !prescribeForm.quantity.trim()"
                >
                  Recetar Tratamiento
                </button>
              </div>
            </form>

          </div>
        </div>
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

  // Collapsible States
  readonly showWorkflowDiagram = signal(false);
  readonly showAddProcedure = signal(false);
  readonly showEvolutionHistory = signal(false);
  readonly showRegisterEvolution = signal(false);
  readonly showPaymentsHistory = signal(false);

  // Modal States
  readonly showMedicalRecordModal = signal(false);
  readonly showPrescribeModal = signal(false);

  // Medical Record Form
  medicalRecordForm = {
    antecedentesMedicos: '',
    alergias: '',
    motivoConsulta: '',
    diagnosticoEstetico: '',
    zonasTratamiento: '',
    contraindicaciones: '',
    cuidadosPost: '',
  };

  // Simplified Prescription Form: Medicamento, Cantidad, Indicaciones
  prescribeForm = {
    name: '',
    quantity: '',
    notes: '',
  };

  get prescriptionPresets() {
    const role = this.authService.currentRole();
    if (role === 'cosmetologa') {
      return [
        {
          name: 'Drenaje Linfático Post-Quirúrgico',
          quantity: '5 Sesiones (45 min)',
          notes: 'Drenaje manual distal a proximal. Usar faja compresiva después.',
        },
        {
          name: 'Limpieza Facial Profunda + Punta Diamante',
          quantity: '1 Sesión (60 min)',
          notes: 'No aplicar maquillaje 24h. Usar protector solar FPS 50+ cada 3h.',
        },
        {
          name: 'Radiofrecuencia Facial y Cuello',
          quantity: '4 Sesiones (quincenal)',
          notes: 'Hidratación con ácido hialurónico tópico. Evitar calor directo o sauna 48h.',
        },
        {
          name: 'Masaje Reductor y Moldeador',
          quantity: '8 Sesiones (2x semana)',
          notes: 'Tomar al menos 2 litros de agua diarios para drenaje metabólico.',
        },
      ];
    }
    return [
      {
        name: 'Toxina Botulínica (Botox)',
        quantity: '50 Unidades',
        notes: 'No frotar la zona 4h. Evitar acostarse o ejercicio físico vigoroso por 24h.',
      },
      {
        name: 'Ácido Hialurónico Labios',
        quantity: '1 Jeringa (1ml)',
        notes: 'Aplicar frío local primeras 6 horas. Hidratación constante con bálsamo.',
      },
      {
        name: 'Bioestimulador Radiesse',
        quantity: '1 Vial (1.5ml)',
        notes: 'Regla del 5-5-5: masaje 5 minutos, 5 veces al día por 5 días.',
      },
      {
        name: 'Bioestimulador Sculptra',
        quantity: '1 Vial',
        notes: 'Masaje post-tratamiento 5 min al día por 5 días. Control en 4 semanas.',
      },
      {
        name: 'Peeling Químico Médico',
        quantity: '2 Capas',
        notes: 'Uso estricto de protector solar FPS 50+ cada 3 horas. No retirar descamación.',
      },
      {
        name: 'Plasma Rico en Plaquetas (PRP)',
        quantity: '1 Sesión (Tubo)',
        notes: 'Lavar con agua tibia sin jabón por 12 horas. Evitar maquillaje 24h.',
      },
    ];
  }

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

  toggleWorkflowDiagram(): void {
    this.showWorkflowDiagram.update(v => !v);
  }

  toggleAddProcedure(): void {
    this.showAddProcedure.update(v => !v);
  }

  submitProcedure(): void {
    const p = this.patient();
    if (!p || !this.newEvolutionNotes.trim()) return;

    let treatmentName = 'Procedimiento Clínico';
    let sessionNumber = 1;

    if (this.newEvolutionTreatmentId) {
      const treatment = p.treatments.find(t => t.id === this.newEvolutionTreatmentId);
      if (treatment) {
        treatmentName = treatment.name;
        sessionNumber = (treatment.completedSessions || 0) + 1;
      }
    }

    this.dataService.addClinicalEvolution(p.id, {
      treatmentId: this.newEvolutionTreatmentId || 'proc-directo',
      treatmentName,
      sessionNumber,
      date: new Date().toISOString().split('T')[0],
      notes: this.newEvolutionNotes.trim(),
      specialistName: this.authService.currentUser()?.name || 'Especialista',
      specialistId: this.authService.currentUser()?.id || '',
    });

    this.patient.set(this.dataService.getPatientById(p.id));
    this.newEvolutionNotes = '';
    this.showAddProcedure.set(false);
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

  // ─── Medical Record Actions ─────────────────────────────
  openMedicalRecordModal(): void {
    const p = this.patient();
    const rec = p?.medicalRecord;
    this.medicalRecordForm = {
      antecedentesMedicos: rec?.antecedentesMedicos || '',
      alergias: rec?.alergias || '',
      motivoConsulta: rec?.motivoConsulta || '',
      diagnosticoEstetico: rec?.diagnosticoEstetico || '',
      zonasTratamiento: rec?.zonasTratamiento || '',
      contraindicaciones: rec?.contraindicaciones || '',
      cuidadosPost: rec?.cuidadosPost || '',
    };
    this.showMedicalRecordModal.set(true);
  }

  closeMedicalRecordModal(): void {
    this.showMedicalRecordModal.set(false);
  }

  saveMedicalRecord(): void {
    const p = this.patient();
    if (!p) return;

    const doctorName = this.authService.currentUser()?.name || 'Dr. Andrés Castaño';
    const record: MedicalRecord = {
      antecedentesMedicos: this.medicalRecordForm.antecedentesMedicos.trim() || 'Sin antecedentes patológicos relevantes',
      alergias: this.medicalRecordForm.alergias.trim() || 'Niega alergias medicamentosas',
      motivoConsulta: this.medicalRecordForm.motivoConsulta.trim(),
      diagnosticoEstetico: this.medicalRecordForm.diagnosticoEstetico.trim(),
      zonasTratamiento: this.medicalRecordForm.zonasTratamiento.trim() || 'Rostro / Facial',
      contraindicaciones: this.medicalRecordForm.contraindicaciones.trim() || 'Ninguna contraindicación activa',
      cuidadosPost: this.medicalRecordForm.cuidadosPost.trim() || 'Cuidados estándar post-procedimiento',
      registradoPor: p.medicalRecord?.registradoPor || doctorName,
      fechaRegistro: p.medicalRecord?.fechaRegistro || new Date().toISOString().split('T')[0],
      ultimaActualizacion: new Date().toISOString().split('T')[0],
    };

    this.dataService.saveMedicalRecord(p.id, record);
    this.patient.set(this.dataService.getPatientById(p.id));
    this.showMedicalRecordModal.set(false);
  }

  // ─── Prescription Actions ───────────────────────────────
  openPrescribeModal(): void {
    const defaultPreset = this.prescriptionPresets[0];
    this.prescribeForm = {
      name: defaultPreset?.name || '',
      quantity: defaultPreset?.quantity || '',
      notes: defaultPreset?.notes || '',
    };
    this.showPrescribeModal.set(true);
  }

  closePrescribeModal(): void {
    this.showPrescribeModal.set(false);
  }

  selectPrescriptionPreset(preset: { name: string; quantity: string; notes: string }): void {
    this.prescribeForm = {
      name: preset.name,
      quantity: preset.quantity,
      notes: preset.notes,
    };
  }

  submitPrescription(): void {
    const p = this.patient();
    if (!p || !this.prescribeForm.name.trim() || !this.prescribeForm.quantity.trim()) return;

    const user = this.authService.currentUser();
    const doctorName = user?.name || 'Dr. Andrés Castaño';
    const doctorId = user?.id || 'usr-003';
    const isCosmetologa = this.authService.currentRole() === 'cosmetologa';

    this.dataService.prescribeTreatment(
      p.id,
      {
        name: this.prescribeForm.name.trim(),
        dosage: this.prescribeForm.quantity.trim(),
        prescriptionNotes: this.prescribeForm.notes.trim(),
        category: isCosmetologa ? 'corporal-cosmetologia' : 'medico-no-invasivo',
        totalSessions: 1,
        totalCost: 0,
      },
      doctorName,
      doctorId
    );

    this.patient.set(this.dataService.getPatientById(p.id));
    this.showPrescribeModal.set(false);
  }
}
