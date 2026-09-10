export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export type AppointmentCreatedBy = 'CLIENT_SELF' | 'STAFF';

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;         // Teléfono con formato WhatsApp
  patientEmail?: string;
  serviceId: string;
  serviceName: string;
  specialistId?: string;        // 'usr-003' Dr. Andrés, 'usr-004' Camila Herrera
  specialistName?: string;
  date: string;                 // 'YYYY-MM-DD'
  timeSlot: string;             // '08:00', '09:00', ... '16:00'
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  createdBy: AppointmentCreatedBy;
  confirmedBy?: string;         // Nombre o ID del staff que confirmó
}

export interface AvailabilitySlot {
  date: string;                 // 'YYYY-MM-DD'
  time: string;                 // '08:00', '09:00', ..., '16:00'
  specialistId?: string;
  isAvailable: boolean;
  appointmentId?: string;       // ID de la cita que ocupa el espacio
}

export type AppointmentNotificationType = 'NEW_APPOINTMENT' | 'CANCELLATION' | 'RESCHEDULE';

export interface AppointmentNotification {
  id: string;
  appointmentId: string;
  type: AppointmentNotificationType;
  message: string;
  patientName: string;
  serviceName: string;
  timeSlot: string;
  date: string;
  read: boolean;
  createdAt: string;
}

export type AuditEntityType = 'APPOINTMENT' | 'PATIENT' | 'TREATMENT' | 'PAYMENT' | 'EXPENSE' | 'AUTH' | 'CLIENT';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VOID' | 'CONTACT_ATTEMPTED' | 'LOGIN' | 'LOGOUT' | 'CONVERT';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  entityType: AuditEntityType;
  action: AuditAction;
  entityId: string;
  details: string;
}

export interface PublicService {
  id: string;
  name: string;
  category: 'medico-no-invasivo' | 'corporal-cosmetologia';
  categoryLabel: string;
  durationMinutes: number;
  startingPriceCop: number;
  description: string;
  recommendedSpecialistId?: string;
}

export interface Specialist {
  id: string;
  name: string;
  title: string;
  licenseNumber: string;
  education: string;
  role: string;
  specialty: string;
  category: 'medico-no-invasivo' | 'corporal-cosmetologia';
  description: string;
  keyProcedures: string[];
  experience: string;
  schedule: string;
  photoUrl: string;
}

