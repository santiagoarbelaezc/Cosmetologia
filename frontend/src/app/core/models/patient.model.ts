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
