import { Injectable, inject, signal, computed } from '@angular/core';
import { ClientLead, ClientStatus } from '../models/client.model';
import { AuditService } from './audit.service';
import { AuthService } from './auth.service';
import { MockDataService } from './mock-data.service';
import { Patient } from '../models/patient.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly audit = inject(AuditService);
  private readonly auth = inject(AuthService);
  private readonly mockData = inject(MockDataService);

  private readonly _clients = signal<ClientLead[]>([
    {
      id: 'cli-001',
      name: 'Mariana Soto Valderrama',
      phone: '+57 312 456 7890',
      email: 'mariana.soto@gmail.com',
      firstContactDate: '2026-09-09',
      lastContactDate: '2026-09-09',
      status: 'CONFIRMED',
      channel: 'LANDING_WEB',
      requestedServiceId: 'srv-001',
      requestedServiceName: 'Toxina Botulínica (Botox)',
      preferredSpecialistId: 'usr-003',
      preferredSpecialistName: 'Dr. Andrés Castaño',
      notes: 'Líneas dinámicas en tercio superior. Desea valoración facial de alta precisión.',
      appointmentCount: 1,
      lastAppointmentDate: '2026-09-12',
    },
    {
      id: 'cli-002',
      name: 'Esteban Morales Peña',
      phone: '+57 300 987 6543',
      email: 'esteban.morales@hotmail.com',
      firstContactDate: '2026-09-09',
      lastContactDate: '2026-09-09',
      status: 'NEW',
      channel: 'LANDING_WEB',
      requestedServiceId: 'srv-006',
      requestedServiceName: 'Limpieza Facial Profunda + Punta Diamante',
      preferredSpecialistId: 'usr-004',
      preferredSpecialistName: 'Camila Herrera',
      notes: 'Higiene facial profunda y extracción de comedones.',
      appointmentCount: 1,
      lastAppointmentDate: '2026-09-12',
    },
    {
      id: 'cli-003',
      name: 'Carolina Echeverri Londoño',
      phone: '+57 311 234 5678',
      email: 'carolina.ech@yahoo.com',
      firstContactDate: '2026-09-08',
      lastContactDate: '2026-09-09',
      status: 'CONTACTED',
      channel: 'LANDING_WEB',
      requestedServiceId: 'srv-002',
      requestedServiceName: 'Ácido Hialurónico Labios & Surcos',
      preferredSpecialistId: 'usr-003',
      preferredSpecialistName: 'Dr. Andrés Castaño',
      notes: 'Pregunta por volumen e hidratación sutil en labios.',
      appointmentCount: 1,
      lastAppointmentDate: '2026-09-14',
    },
    {
      id: 'cli-004',
      name: 'Felipe Arboleda Ruiz',
      phone: '+57 318 555 4321',
      email: 'felipe.arboleda@outlook.com',
      firstContactDate: '2026-09-07',
      lastContactDate: '2026-09-08',
      status: 'CONTACTED',
      channel: 'LANDING_WEB',
      requestedServiceId: 'srv-003',
      requestedServiceName: 'Bioestimulador Radiesse',
      preferredSpecialistId: 'usr-003',
      preferredSpecialistName: 'Dr. Andrés Castaño',
      notes: 'Canceló cita por viaje de negocios; pendiente reagendamiento para fin de mes.',
      appointmentCount: 1,
      lastAppointmentDate: '2026-09-15',
    },
    {
      id: 'cli-005',
      name: 'Daniela Zuluaga Gómez',
      phone: '+57 320 876 5432',
      email: 'daniela.zuluaga@gmail.com',
      firstContactDate: '2026-09-05',
      lastContactDate: '2026-09-08',
      status: 'CONVERTED',
      channel: 'WHATSAPP',
      requestedServiceId: 'srv-005',
      requestedServiceName: 'Drenaje Linfático Post-Quirúrgico',
      preferredSpecialistId: 'usr-004',
      preferredSpecialistName: 'Camila Herrera',
      notes: 'Convertida exitosamente a paciente clínica con expediente pat-004.',
      appointmentCount: 2,
      lastAppointmentDate: '2026-09-15',
      patientId: 'pat-004',
    },
  ]);

  readonly clients = this._clients.asReadonly();

  readonly totalClients = computed(() => this._clients().length);
  readonly newClientsCount = computed(() => this._clients().filter(c => c.status === 'NEW').length);
  readonly contactedClientsCount = computed(() => this._clients().filter(c => c.status === 'CONTACTED').length);
  readonly confirmedClientsCount = computed(() => this._clients().filter(c => c.status === 'CONFIRMED').length);
  readonly convertedClientsCount = computed(() => this._clients().filter(c => c.status === 'CONVERTED').length);

  /**
   * Automatically saves or updates client lead when someone books an appointment
   */
  registerFromBooking(data: {
    patientName: string;
    patientPhone: string;
    patientEmail?: string;
    serviceId: string;
    serviceName: string;
    specialistId?: string;
    specialistName?: string;
    date: string;
    notes?: string;
    channel?: 'LANDING_WEB' | 'WHATSAPP' | 'DIRECTO';
  }): ClientLead {
    const cleanPhone = data.patientPhone.trim().replace(/\s+/g, '');
    const cleanName = data.patientName.trim();

    const existingIndex = this._clients().findIndex(
      c => c.phone.replace(/\s+/g, '') === cleanPhone || (data.patientEmail && c.email && c.email.toLowerCase() === data.patientEmail.toLowerCase().trim())
    );

    const now = new Date().toISOString().split('T')[0];

    if (existingIndex >= 0) {
      const existing = this._clients()[existingIndex];
      const updated: ClientLead = {
        ...existing,
        name: cleanName || existing.name,
        email: data.patientEmail?.trim() || existing.email,
        lastContactDate: now,
        requestedServiceId: data.serviceId,
        requestedServiceName: data.serviceName,
        preferredSpecialistId: data.specialistId || existing.preferredSpecialistId,
        preferredSpecialistName: data.specialistName || existing.preferredSpecialistName,
        appointmentCount: existing.appointmentCount + 1,
        lastAppointmentDate: data.date,
        notes: data.notes ? `${existing.notes ? existing.notes + ' | ' : ''}[${now}]: ${data.notes.trim()}` : existing.notes,
      };

      this._clients.update(list => {
        const copy = [...list];
        copy[existingIndex] = updated;
        return copy;
      });

      this.audit.log({
        userId: this.auth.currentUser()?.id || 'client-online',
        userName: this.auth.currentUser()?.name || cleanName,
        userRole: this.auth.currentUser()?.role || 'Cliente Web',
        entityType: 'CLIENT',
        action: 'UPDATE',
        entityId: existing.id,
        details: `Cliente ${existing.name} registró nueva cita para ${data.serviceName} el ${data.date}. Historial actualizado (${updated.appointmentCount} citas solicitadas).`,
      });

      return updated;
    } else {
      const newId = `cli-${Date.now().toString().slice(-4)}`;
      const newLead: ClientLead = {
        id: newId,
        name: cleanName,
        phone: data.patientPhone.trim(),
        email: data.patientEmail?.trim() || undefined,
        firstContactDate: now,
        lastContactDate: now,
        status: 'NEW',
        channel: data.channel || 'LANDING_WEB',
        requestedServiceId: data.serviceId,
        requestedServiceName: data.serviceName,
        preferredSpecialistId: data.specialistId,
        preferredSpecialistName: data.specialistName,
        notes: data.notes?.trim() || undefined,
        appointmentCount: 1,
        lastAppointmentDate: data.date,
      };

      this._clients.update(list => [newLead, ...list]);

      this.audit.log({
        userId: this.auth.currentUser()?.id || 'client-online',
        userName: this.auth.currentUser()?.name || cleanName,
        userRole: this.auth.currentUser()?.role || 'Cliente Web',
        entityType: 'CLIENT',
        action: 'CREATE',
        entityId: newId,
        details: `Nuevo cliente registrado en la base de datos: ${cleanName} (${data.patientPhone}) interesado en ${data.serviceName}.`,
      });

      return newLead;
    }
  }

  updateClientStatus(id: string, status: ClientStatus): void {
    const client = this._clients().find(c => c.id === id);
    if (!client) return;

    this._clients.update(list =>
      list.map(c => (c.id === id ? { ...c, status, lastContactDate: new Date().toISOString().split('T')[0] } : c))
    );

    const currentUser = this.auth.currentUser();
    this.audit.log({
      userId: currentUser?.id || 'staff',
      userName: currentUser?.name || 'Administración',
      userRole: currentUser?.role || 'Administradora',
      entityType: 'CLIENT',
      action: 'UPDATE',
      entityId: id,
      details: `Estado del cliente ${client.name} modificado a ${status}.`,
    });
  }

  updateClientNotes(id: string, notes: string): void {
    this._clients.update(list =>
      list.map(c => (c.id === id ? { ...c, notes: notes.trim(), lastContactDate: new Date().toISOString().split('T')[0] } : c))
    );
  }

  convertToPatient(clientId: string, documentId: string, assignedSpecialistId?: string): Patient | null {
    const client = this._clients().find(c => c.id === clientId);
    if (!client) return null;

    const nameParts = client.name.trim().split(' ');
    const firstName = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ') || client.name;
    const lastName = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ') || 'Gómez';

    const newPatient = this.mockData.addPatient({
      firstName,
      lastName,
      documentId: documentId || `CC-1.${Math.floor(100000000 + Math.random() * 900000000)}`,
      phone: client.phone,
      email: client.email || `${firstName.toLowerCase().replace(/\s+/g, '')}@email.com`,
      birthDate: '1995-05-12',
      assignedSpecialistId: assignedSpecialistId || client.preferredSpecialistId || 'usr-003',
      treatments: [],
      clinicalHistory: [],
    });

    this._clients.update(list =>
      list.map(c =>
        c.id === clientId
          ? {
              ...c,
              status: 'CONVERTED',
              patientId: newPatient.id,
              lastContactDate: new Date().toISOString().split('T')[0],
            }
          : c
      )
    );

    const currentUser = this.auth.currentUser();
    this.audit.log({
      userId: currentUser?.id || 'staff',
      userName: currentUser?.name || 'Administración',
      userRole: currentUser?.role || 'Administradora',
      entityType: 'CLIENT',
      action: 'CONVERT',
      entityId: clientId,
      details: `Cliente ${client.name} convertido con éxito en Paciente Clínico (ID: ${newPatient.id}, Doc: ${newPatient.documentId}).`,
    });

    return newPatient;
  }
}
