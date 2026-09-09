import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { AuthService } from '../../core/services/auth.service';
import { PermissionsService } from '../../core/services/permissions.service';
import { PillTabsComponent } from '../../shared/components/pill-tabs/pill-tabs.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { PaymentModalComponent, PaymentFormData } from '../../shared/components/payment-modal/payment-modal.component';
import { CurrencyCopPipe } from '../../shared/pipes/currency-cop.pipe';
import { WorkflowDiagramComponent } from '../../shared/components/workflow-diagram/workflow-diagram.component';
import { Patient, TreatmentCategory } from '../../core/models/patient.model';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    CommonModule,
    PillTabsComponent,
    ProgressBarComponent,
    PaymentModalComponent,
    CurrencyCopPipe,
    WorkflowDiagramComponent,
  ],
  template: `
    @if (patient(); as p) {
      <div class="animate-fade-in space-y-6">
        <!-- Back Button -->
        <button (click)="goBack()" class="btn-ghost -ml-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver
        </button>

        <!-- ═══════════════════════════════════════════════ -->
        <!-- Patient Header Card                            -->
        <!-- ═══════════════════════════════════════════════ -->
        <section class="card p-6">
          <div class="flex flex-col sm:flex-row items-start gap-5">
            <div class="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
              <span class="text-xl font-bold text-zinc-500">
                {{ p.firstName.charAt(0) }}{{ p.lastName.charAt(0) }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <h1 class="text-xl font-bold tracking-tight text-zinc-900">
                {{ p.firstName }} {{ p.lastName }}
              </h1>
              <div class="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2">
                <span class="flex items-center gap-1.5 text-sm text-zinc-500">
                  <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                  </svg>
                  {{ p.documentId }}
                </span>
                <span class="flex items-center gap-1.5 text-sm text-zinc-500">
                  <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  {{ p.phone }}
                </span>
                <span class="flex items-center gap-1.5 text-sm text-zinc-500">
                  <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  {{ p.email }}
                </span>
              </div>
            </div>
            <div class="text-right flex-shrink-0">
              <p class="micro-label">Tratamientos</p>
              <p class="text-2xl font-bold text-zinc-900">{{ visibleTreatments().length }}</p>
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════ -->
        <!-- Workflow Progress Diagram                       -->
        <!-- ═══════════════════════════════════════════════ -->
        <app-workflow-diagram [patient]="p" />

        <!-- ═══════════════════════════════════════════════ -->
        <!-- Financial Card (Gerente + Administradora ONLY) -->
        <!-- ═══════════════════════════════════════════════ -->
        @if (permissions.canViewFinancials()) {
          <section class="card p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="section-title">Estado de Cuenta</h2>
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
              <div class="bg-zinc-50/80 rounded-xl px-4 py-3.5">
                <p class="micro-label mb-1">Costo Total</p>
                <p class="text-xl font-bold tracking-tight text-zinc-900">{{ accountBalance().totalCost | currencyCop }}</p>
              </div>
              <div class="bg-zinc-50/80 rounded-xl px-4 py-3.5">
                <p class="micro-label mb-1">Abonos Realizados</p>
                <p class="text-xl font-bold tracking-tight text-emerald-600">{{ accountBalance().totalPaid | currencyCop }}</p>
              </div>
              <div class="rounded-xl px-4 py-3.5" [ngClass]="accountBalance().pendingBalance > 0 ? 'bg-rose-50' : 'bg-zinc-50'">
                <p class="micro-label mb-1">Saldo Pendiente</p>
                <div class="flex items-center gap-2">
                  <p class="text-xl font-bold tracking-tight" [ngClass]="accountBalance().pendingBalance > 0 ? 'text-rose-600' : 'text-zinc-900'">
                    {{ accountBalance().pendingBalance | currencyCop }}
                  </p>
                  @if (accountBalance().pendingBalance > 0) {
                    <span class="badge-pending text-[10px]">Pendiente</span>
                  } @else {
                    <span class="badge-completed text-[10px]">Al día</span>
                  }
                </div>
              </div>
            </div>
          </section>
        }

        <!-- ═══════════════════════════════════════════════ -->
        <!-- Treatment List (filtered by specialty)         -->
        <!-- ═══════════════════════════════════════════════ -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <h2 class="section-title">Tratamientos</h2>
          </div>

          <!-- Pill tabs: only show if user can see BOTH categories -->
          @if (availableTabs().length > 1) {
            <div class="mb-5">
              <app-pill-tabs
                [tabs]="availableTabs()"
                [activeTab]="activeCategory()"
                (tabChange)="activeCategory.set($event)"
              />
            </div>
          } @else if (availableTabs().length === 1) {
            <p class="micro-label mb-4">{{ availableTabs()[0] }}</p>
          }

          <div class="space-y-4">
            @for (treatment of filteredTreatments(); track treatment.id) {
              <div class="card p-5 animate-slide-up">
                <div class="flex items-start justify-between mb-3">
                  <div class="min-w-0 flex-1 mr-4">
                    <h3 class="text-sm font-bold text-zinc-900">{{ treatment.name }}</h3>
                    <p class="micro-label mt-1">
                      {{ treatment.category === 'corporal-cosmetologia' ? 'Cosmetología' : 'Procedimiento Médico' }}
                    </p>
                  </div>
                  <span
                    [ngClass]="treatment.status === 'active' ? 'badge-active' :
                               treatment.status === 'completed' ? 'badge-completed' : 'badge-paused'"
                  >
                    {{ treatment.status === 'active' ? 'Activo' :
                       treatment.status === 'completed' ? 'Completado' : 'Pausado' }}
                  </span>
                </div>

                <app-progress-bar
                  [current]="treatment.completedSessions"
                  [total]="treatment.totalSessions"
                />

                <!-- Treatment Financials — Gerente + Administradora only -->
                @if (permissions.canViewFinancials()) {
                  <div class="flex items-center gap-6 mt-4 pt-3 border-t border-zinc-100">
                    <div>
                      <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Costo</p>
                      <p class="text-sm font-bold text-zinc-800">{{ treatment.totalCost | currencyCop }}</p>
                    </div>
                    <div>
                      <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Pagado</p>
                      <p class="text-sm font-bold text-emerald-600">{{ treatment.totalPaid | currencyCop }}</p>
                    </div>
                    @if (treatment.totalCost - treatment.totalPaid > 0) {
                      <div>
                        <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Pendiente</p>
                        <p class="text-sm font-bold text-rose-500">{{ treatment.totalCost - treatment.totalPaid | currencyCop }}</p>
                      </div>
                    }
                  </div>
                }
              </div>
            }

            @if (filteredTreatments().length === 0) {
              <div class="text-center py-12 card">
                <p class="text-sm text-zinc-400">No hay tratamientos en esta categoría</p>
              </div>
            }
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════ -->
        <!-- Clinical History                               -->
        <!-- ═══════════════════════════════════════════════ -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <h2 class="section-title">Historial de Evolución</h2>
            @if (permissions.canRegisterEvolution()) {
              <button class="btn-secondary text-xs px-4 py-2">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Registrar Evolución
              </button>
            }
          </div>

          <div class="relative">
            <div class="absolute left-5 top-0 bottom-0 w-px bg-zinc-200"></div>

            <div class="space-y-0">
              @for (session of visibleHistory(); track session.id) {
                <div class="relative flex gap-4 pb-6">
                  <div class="relative z-10 w-10 h-10 rounded-full bg-white border-2 border-zinc-200 flex items-center justify-center flex-shrink-0">
                    <span class="text-xs font-bold text-zinc-500">{{ session.sessionNumber }}</span>
                  </div>
                  <div class="card flex-1 p-4">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-zinc-800">{{ session.treatmentName }}</span>
                        <span class="text-[10px] text-zinc-400">·</span>
                        <span class="text-xs text-zinc-400">Sesión {{ session.sessionNumber }}</span>
                      </div>
                      <span class="text-xs text-zinc-400">{{ session.date | date:'d MMM, y' }}</span>
                    </div>
                    <p class="text-sm text-zinc-600 leading-relaxed">{{ session.notes }}</p>
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mt-2">
                      {{ session.specialistName }}
                    </p>
                  </div>
                </div>
              }
            </div>

            @if (visibleHistory().length === 0) {
              <div class="text-center py-12 ml-14">
                <p class="text-sm text-zinc-400">Sin registros de evolución aún</p>
              </div>
            }
          </div>
        </section>
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
        <button (click)="goBack()" class="btn-primary">Volver al Dashboard</button>
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

  private readonly TAB_LABELS: Record<string, TreatmentCategory> = {
    'Corporal / Cosmetología': 'corporal-cosmetologia',
    'Procedimientos Médicos': 'medico-no-invasivo',
  };

  private readonly CATEGORY_TO_TAB: Record<TreatmentCategory, string> = {
    'corporal-cosmetologia': 'Corporal / Cosmetología',
    'medico-no-invasivo': 'Procedimientos Médicos',
  };

  /** Only the tabs the current user is allowed to see */
  readonly availableTabs = computed(() => {
    const allowed = this.permissions.visibleTreatmentCategories();
    return allowed.map(cat => this.CATEGORY_TO_TAB[cat]);
  });

  /** All treatments the user can see (across all their allowed categories) */
  readonly visibleTreatments = computed(() => {
    const p = this.patient();
    if (!p) return [];
    const allowed = this.permissions.visibleTreatmentCategories();
    return p.treatments.filter(t => allowed.includes(t.category));
  });

  /** Treatments filtered by the active tab */
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

  /** Clinical sessions filtered by the user's allowed treatment categories */
  readonly visibleHistory = computed(() => {
    const p = this.patient();
    if (!p) return [];
    const allowed = this.permissions.visibleTreatmentCategories();
    // Map treatment IDs to their categories
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

    // Set default active tab to the user's first allowed category
    const tabs = this.availableTabs();
    if (tabs.length > 0) {
      this.activeCategory.set(tabs[0]);
    }
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

    // Refresh patient data
    this.patient.set(this.dataService.getPatientById(p.id));
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
