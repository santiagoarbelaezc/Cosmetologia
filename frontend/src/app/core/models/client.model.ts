export type ClientStatus = 'NEW' | 'CONTACTED' | 'CONFIRMED' | 'CONVERTED' | 'ARCHIVED';

export interface ClientLead {
  id: string; // e.g. cli-001
  name: string;
  phone: string;
  email?: string;
  firstContactDate: string;
  lastContactDate: string;
  status: ClientStatus;
  channel: 'LANDING_WEB' | 'WHATSAPP' | 'DIRECTO';
  requestedServiceId: string;
  requestedServiceName: string;
  preferredSpecialistId?: string;
  preferredSpecialistName?: string;
  notes?: string;
  appointmentCount: number;
  lastAppointmentDate?: string;
  patientId?: string; // ID if converted to clinical patient
}
