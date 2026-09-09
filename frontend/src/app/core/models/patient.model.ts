export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  documentId: string;
  phone: string;
  email: string;
  birthDate: string;
  photoUrl?: string;
  assignedSpecialistId: string;
  treatments: Treatment[];
  clinicalHistory: ClinicalSession[];
  createdAt: string;
}

export interface Treatment {
  id: string;
  name: string;
  category: TreatmentCategory;
  totalSessions: number;
  completedSessions: number;
  totalCost: number;
  totalPaid: number;
  status: TreatmentStatus;
}

export interface ClinicalSession {
  id: string;
  treatmentId: string;
  treatmentName: string;
  sessionNumber: number;
  date: string;
  notes: string;
  specialistName: string;
  specialistId: string;
}

export type TreatmentCategory = 'corporal-cosmetologia' | 'medico-no-invasivo';
export type TreatmentStatus = 'active' | 'completed' | 'paused';
export type WorkflowStepStatus = 'completed' | 'in_progress' | 'pending';

export interface WorkflowStage {
  id: string;
  stageNumber: number;
  name: string;
  shortLabel: string;
  status: WorkflowStepStatus;
  statusLabel: string;
  date?: string;
  specialistName?: string;
  description: string;
  metric?: string;
  notes?: string;
}

/**
 * Calculates a structured 5-stage clinical workflow diagram for any patient
 */
export function computePatientWorkflow(patient: Patient): WorkflowStage[] {
  const totalSessions = patient.treatments.reduce((acc, t) => acc + t.totalSessions, 0);
  const completedSessions = patient.treatments.reduce((acc, t) => acc + t.completedSessions, 0);
  const allCompleted = patient.treatments.length > 0 && patient.treatments.every(t => t.status === 'completed');
  const latestSession = patient.clinicalHistory.length > 0
    ? [...patient.clinicalHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;

  const percent = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  // Stage 1: Valoración & Diagnóstico
  const stage1: WorkflowStage = {
    id: 'st-1',
    stageNumber: 1,
    name: 'Valoración & Diagnóstico',
    shortLabel: 'Diagnóstico',
    status: 'completed',
    statusLabel: 'Completado',
    date: patient.createdAt,
    specialistName: latestSession?.specialistName || 'Especialista a cargo',
    description: 'Anamnesis completa, evaluación dérmica y aptitud clínica aprobada.',
    metric: 'Apto para procedimiento',
  };

  // Stage 2: Plan Clínico & Consentimiento
  const stage2: WorkflowStage = {
    id: 'st-2',
    stageNumber: 2,
    name: 'Plan Clínico & Consentimiento',
    shortLabel: 'Plan Aprobado',
    status: 'completed',
    statusLabel: 'Firmado',
    date: patient.createdAt,
    description: `${patient.treatments.length} tratamiento(s) formulados con consentimiento legal firmado.`,
    metric: `${totalSessions} sesiones planificadas`,
  };

  // Stage 3: Ejecución de Sesiones
  let stage3Status: WorkflowStepStatus = 'pending';
  let stage3StatusLabel = 'Pendiente';
  if (completedSessions >= totalSessions && totalSessions > 0) {
    stage3Status = 'completed';
    stage3StatusLabel = '100% Ejecutado';
  } else if (completedSessions > 0) {
    stage3Status = 'in_progress';
    stage3StatusLabel = `${percent}% en curso`;
  }

  const stage3: WorkflowStage = {
    id: 'st-3',
    stageNumber: 3,
    name: 'Ejecución de Sesiones',
    shortLabel: 'Tratamiento Activo',
    status: stage3Status,
    statusLabel: stage3StatusLabel,
    date: latestSession ? latestSession.date : undefined,
    specialistName: latestSession?.specialistName,
    description: latestSession ? `Última sesión: ${latestSession.treatmentName}` : 'A la espera de iniciar primera sesión',
    metric: `${completedSessions} / ${totalSessions} sesiones`,
    notes: latestSession?.notes,
  };

  // Stage 4: Control & Evaluación
  let stage4Status: WorkflowStepStatus = 'pending';
  let stage4StatusLabel = 'Programado';
  if (allCompleted) {
    stage4Status = 'completed';
    stage4StatusLabel = 'Aprobado';
  } else if (percent >= 50) {
    stage4Status = 'in_progress';
    stage4StatusLabel = 'Control activo';
  }

  const stage4: WorkflowStage = {
    id: 'st-4',
    stageNumber: 4,
    name: 'Control & Evaluación Clínica',
    shortLabel: 'Control de Resultados',
    status: stage4Status,
    statusLabel: stage4StatusLabel,
    date: latestSession?.date,
    description: percent >= 50
      ? 'Seguimiento fotográfico y evolución tisular favorable.'
      : 'Control programado al alcanzar el 50% del ciclo.',
    metric: percent >= 50 ? 'Evolución Positiva' : 'Pendiente hito 50%',
  };

  // Stage 5: Alta Médica / Mantenimiento
  let stage5Status: WorkflowStepStatus = 'pending';
  let stage5StatusLabel = 'Próximamente';
  if (allCompleted) {
    stage5Status = 'completed';
    stage5StatusLabel = 'Alta Otorgada';
  } else if (percent >= 80) {
    stage5Status = 'in_progress';
    stage5StatusLabel = 'En fase final';
  }

  const stage5: WorkflowStage = {
    id: 'st-5',
    stageNumber: 5,
    name: 'Alta Estética & Mantenimiento',
    shortLabel: 'Alta / Mantenimiento',
    status: stage5Status,
    statusLabel: stage5StatusLabel,
    description: allCompleted
      ? 'Tratamiento completado con éxito. En esquema de mantenimiento preventivo.'
      : 'Cierre del plan y pase a citas de sostenimiento.',
    metric: allCompleted ? 'Objetivo 100% Logrado' : `${totalSessions - completedSessions} sesiones para alta`,
  };

  return [stage1, stage2, stage3, stage4, stage5];
}
