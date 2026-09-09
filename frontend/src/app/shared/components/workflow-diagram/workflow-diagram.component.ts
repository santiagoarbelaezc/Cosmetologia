import { Component, Input, Output, EventEmitter, signal, computed, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Patient, WorkflowStage, computePatientWorkflow } from '../../../core/models/patient.model';

@Component({
  selector: 'app-workflow-diagram',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card p-6 bg-white border border-zinc-200/90 shadow-sm rounded-2xl">
      <!-- Header with Patient Summary & Progress Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
        <div>
          <div class="flex items-center gap-2">
            <span class="micro-label">Diagrama Clínico de Flujo</span>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                  [ngClass]="overallStatusBadgeClass()">
              {{ overallStatusText() }}
            </span>
          </div>
          <h3 class="text-base sm:text-lg font-bold text-zinc-900 mt-1">
            Progreso Terapéutico y Ciclo del Paciente
          </h3>
          <p class="text-xs text-zinc-500 mt-0.5">
            Etapas clínicas desde el diagnóstico inicial hasta el alta y mantenimiento preventivo
          </p>
        </div>

        <div class="flex items-center gap-4 bg-zinc-50 px-4 py-2.5 rounded-xl border border-zinc-200/60 flex-shrink-0">
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Avance Global</p>
            <p class="text-lg font-bold text-zinc-900 leading-tight">{{ progressPercentage() }}%</p>
          </div>
          <div class="w-24 h-2 bg-zinc-200 rounded-full overflow-hidden">
            <div class="h-full bg-black rounded-full transition-all duration-700 ease-out"
                 [style.width.%]="progressPercentage()"></div>
          </div>
        </div>
      </div>

      <!-- WORKFLOW DIAGRAM: 5 Connected Nodes -->
      <div class="py-6 overflow-x-auto">
        <div class="min-w-[620px] flex items-start justify-between relative px-2">
          
          <!-- Background Line Behind Nodes -->
          <div class="absolute top-5 left-8 right-8 h-0.5 bg-zinc-200 -z-0"></div>

          @for (stage of stages(); track stage.id; let idx = $index) {
            <div class="flex flex-col items-center relative z-10 group cursor-pointer w-28 sm:w-32 text-center"
                 (click)="selectStage(stage)">
              
              <!-- Node Icon Circle -->
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm mb-2.5 ring-4"
                [ngClass]="getNodeCircleClass(stage, idx)"
              >
                <!-- Stage Number or Check Icon -->
                @if (stage.status === 'completed') {
                  <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                } @else if (stage.status === 'in_progress') {
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span class="absolute w-3 h-3 rounded-full bg-emerald-500"></span>
                } @else {
                  <span class="text-xs font-bold text-zinc-400">{{ stage.stageNumber }}</span>
                }
              </div>

              <!-- Node Labels -->
              <span class="text-xs font-bold transition-colors leading-tight line-clamp-2 px-1"
                    [ngClass]="selectedStage()?.id === stage.id ? 'text-zinc-900 font-extrabold' : 'text-zinc-700'">
                {{ stage.shortLabel }}
              </span>

              <!-- Status Badge -->
              <span class="mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    [ngClass]="getBadgeClass(stage.status)">
                {{ stage.statusLabel }}
              </span>

              <!-- Indicator arrow if selected -->
              @if (selectedStage()?.id === stage.id) {
                <div class="w-2 h-2 bg-zinc-900 rotate-45 mt-2 transition-all"></div>
              }
            </div>
          }
        </div>
      </div>

      <!-- ACTIVE STAGE DETAIL DRAWER / CARD -->
      @if (selectedStage(); as st) {
        <div class="mt-2 p-4 bg-zinc-50 border border-zinc-200/90 rounded-xl animate-fade-in">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-200/70">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-xs font-bold">
                F{{ st.stageNumber }}
              </div>
              <div>
                <h4 class="text-sm font-bold text-zinc-900">{{ st.name }}</h4>
                <p class="text-xs text-zinc-500">{{ st.description }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              @if (st.date) {
                <div class="text-right">
                  <p class="text-[10px] uppercase font-semibold text-zinc-400">Fecha de Registro</p>
                  <p class="text-xs font-medium text-zinc-700">{{ st.date }}</p>
                </div>
              }
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                    [ngClass]="getBadgeClass(st.status)">
                {{ st.statusLabel }}
              </span>
            </div>
          </div>

          <!-- Extra Stage Details & Clinical Observation -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-1 text-xs">
            <div class="flex items-center gap-2">
              <span class="text-zinc-400 font-medium">Hito clave:</span>
              <span class="font-semibold text-zinc-800">{{ st.metric || 'En seguimiento clínico' }}</span>
            </div>
            @if (st.specialistName) {
              <div class="flex items-center gap-2">
                <span class="text-zinc-400 font-medium">Responsable:</span>
                <span class="font-semibold text-zinc-800">{{ st.specialistName }}</span>
              </div>
            }
          </div>

          @if (st.notes) {
            <div class="mt-3 p-3 bg-white rounded-lg border border-zinc-200/70 text-xs">
              <p class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Última Nota Clínica / Evolución</p>
              <p class="text-zinc-700 italic">"{{ st.notes }}"</p>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class WorkflowDiagramComponent implements OnChanges {
  @Input({ required: true }) patient!: Patient;
  @Output() viewFullProfile = new EventEmitter<string>();

  readonly stages = signal<WorkflowStage[]>([]);
  readonly selectedStage = signal<WorkflowStage | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['patient'] && this.patient) {
      const calculatedStages = computePatientWorkflow(this.patient);
      this.stages.set(calculatedStages);

      // Default selected stage: the one in progress, or latest completed
      const inProgress = calculatedStages.find(s => s.status === 'in_progress');
      const lastCompleted = [...calculatedStages].reverse().find(s => s.status === 'completed');
      this.selectedStage.set(inProgress || lastCompleted || calculatedStages[0]);
    }
  }

  selectStage(stage: WorkflowStage): void {
    this.selectedStage.set(stage);
  }

  readonly progressPercentage = computed(() => {
    if (!this.patient || !this.patient.treatments.length) return 0;
    const total = this.patient.treatments.reduce((acc, t) => acc + t.totalSessions, 0);
    const completed = this.patient.treatments.reduce((acc, t) => acc + t.completedSessions, 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  });

  overallStatusText(): string {
    const p = this.progressPercentage();
    if (p >= 100) return 'Tratamiento Finalizado / Alta';
    if (p > 0) return `En Curso (${p}%)`;
    return 'Pendiente por Iniciar';
  }

  overallStatusBadgeClass(): string {
    const p = this.progressPercentage();
    if (p >= 100) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (p > 0) return 'bg-zinc-900 text-white';
    return 'bg-zinc-100 text-zinc-600 border border-zinc-200';
  }

  getNodeCircleClass(stage: WorkflowStage, index: number): string {
    const isSelected = this.selectedStage()?.id === stage.id;
    const ring = isSelected ? 'ring-zinc-900 ring-offset-2' : 'ring-white';

    if (stage.status === 'completed') {
      return `bg-black text-white ${ring}`;
    }
    if (stage.status === 'in_progress') {
      return `bg-emerald-50 text-emerald-600 border-2 border-emerald-500 relative ${ring}`;
    }
    return `bg-zinc-100 text-zinc-400 border border-zinc-200 ${ring}`;
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-zinc-100 text-zinc-700';
      case 'in_progress':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200/80';
      default:
        return 'bg-zinc-50 text-zinc-400 border border-zinc-200/60';
    }
  }
}
