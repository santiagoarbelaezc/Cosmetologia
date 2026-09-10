import { Injectable, inject, signal, computed } from '@angular/core';
import {
  Appointment,
  AvailabilitySlot,
  AppointmentNotification,
  PublicService,
  Specialist,
} from '../models/appointment.model';
import { AuditService } from './audit.service';
import { AuthService } from './auth.service';
import { ClientService } from './client.service';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly audit = inject(AuditService);
  private readonly auth = inject(AuthService);
  private readonly clientService = inject(ClientService);

  // ─── Public Services Catalog ──────────────────────────────
  readonly services: PublicService[] = [
    {
      id: 'srv-001',
      name: 'Rinomodelación',
      category: 'medico-no-invasivo',
      categoryLabel: 'Medicina Facial',
      durationMinutes: 45,
      startingPriceCop: 950000,
      description: 'Armonización nasal de alta precisión con ácido hialurónico biocompatible sin cirugía.',
      recommendedSpecialistId: 'usr-003',
    },
    {
      id: 'srv-002',
      name: 'Labios (Perfilado & Relleno)',
      category: 'medico-no-invasivo',
      categoryLabel: 'Medicina Facial',
      durationMinutes: 45,
      startingPriceCop: 850000,
      description: 'Definición, volumen sutil e hidratación dérmica profunda con ácido reticulado.',
      recommendedSpecialistId: 'usr-003',
    },
    {
      id: 'srv-003',
      name: 'Botox (Toxina Botulínica)',
      category: 'medico-no-invasivo',
      categoryLabel: 'Medicina Facial',
      durationMinutes: 40,
      startingPriceCop: 650000,
      description: 'Atenuación armónica de líneas dinámicas en frente, entrecejo y patas de gallo.',
      recommendedSpecialistId: 'usr-003',
    },
    {
      id: 'srv-004',
      name: 'Depilación Láser Médica',
      category: 'corporal-cosmetologia',
      categoryLabel: 'Aparatología Láser',
      durationMinutes: 45,
      startingPriceCop: 220000,
      description: 'Tecnología diodo de alta potencia con cabezal frío para depilación definitiva indolora.',
      recommendedSpecialistId: 'usr-004',
    },
    {
      id: 'srv-005',
      name: 'Limpieza Facial Profunda + Glow',
      category: 'corporal-cosmetologia',
      categoryLabel: 'Cosmetología Facial',
      durationMinutes: 60,
      startingPriceCop: 160000,
      description: 'Higiene dérmica estéril, microdermoabrasión diamante, extracción y velo nutritivo.',
      recommendedSpecialistId: 'usr-004',
    },
    {
      id: 'srv-006',
      name: 'Cierre de Costillas & Remodelación',
      category: 'corporal-cosmetologia',
      categoryLabel: 'Moldeamiento Corporal',
      durationMinutes: 60,
      startingPriceCop: 450000,
      description: 'Terapia no invasiva de reducción del arco costal y estilización de cintura.',
      recommendedSpecialistId: 'usr-004',
    },
    {
      id: 'srv-007',
      name: 'Glúteos (Armonización & Firmeza)',
      category: 'corporal-cosmetologia',
      categoryLabel: 'Moldeamiento Corporal',
      durationMinutes: 60,
      startingPriceCop: 890000,
      description: 'Bioestimulación de colágeno, proyección natural y tonificación de contorno glúteo.',
      recommendedSpecialistId: 'usr-004',
    },
  ];

  // ─── Specialists ──────────────────────────────────────────
  readonly specialists: Specialist[] = [
    {
      id: 'usr-003',
      name: 'Dr. Andrés Castaño',
      title: 'Médico Cirujano & Especialista en Estética Médica',
      licenseNumber: 'R.M. 1047-9281 · MinSalud Colombia',
      education: 'Especialista en Medicina Estética y Antienvejecimiento',
      role: 'Médico Especialista',
      specialty: 'Medicina Estética No Invasiva',
      category: 'medico-no-invasivo',
      description: 'Enfoque en armonización orofacial, bioestimulación de colágeno y rejuvenecimiento de alta precisión sin cirugía.',
      keyProcedures: ['Rinomodelación', 'Labios', 'Botox'],
      experience: '12 años de trayectoria clínica',
      schedule: 'Lunes a Sábado · 8:00 a.m. a 4:00 p.m.',
      photoUrl: '/images/dr_andres.jpg',
    },
    {
      id: 'usr-004',
      name: 'Camila Herrera',
      title: 'Cosmetóloga Cosmiatra & Terapeuta Dermocosmética',
      licenseNumber: 'Reg. T.P. 8832-ANT · Secretaría de Salud',
      education: 'Certificada en Drenaje Linfático Médico & Aparatología Avanzada',
      role: 'Cosmetóloga Especialista',
      specialty: 'Cosmetología & Terapia Corporal',
      category: 'corporal-cosmetologia',
      description: 'Especialista en remodelación de silueta, aparatología de vanguardia y tratamientos dermocosméticos de cabina.',
      keyProcedures: ['Depilación Láser', 'Limpieza Facial', 'Cierre de Costillas', 'Glúteos'],
      experience: '8 años de práctica en cabina clínica',
      schedule: 'Lunes a Sábado · 8:00 a.m. a 4:00 p.m.',
      photoUrl: '/images/camila_herrera.jpg',
    },
  ];

  // ─── Standard Working Hours (8:00 a.m. to 4:00 p.m.) ─────
  readonly dailyTimeSlots: string[] = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
  ];

  // ─── Mock Appointments ────────────────────────────────────
  private readonly _appointments = signal<Appointment[]>([
    {
      id: 'apt-001',
      patientName: 'Mariana Soto Valderrama',
      patientPhone: '+57 312 456 7890',
      patientEmail: 'mariana.soto@gmail.com',
      serviceId: 'srv-001',
      serviceName: 'Toxina Botulínica (Botox)',
      specialistId: 'usr-003',
      specialistName: 'Dr. Andrés Castaño',
      date: '2026-09-12',
      timeSlot: '10:00',
      status: 'CONFIRMED',
      notes: 'Primera vez. Desea evaluación en tercio superior.',
      createdAt: '2026-09-09T08:00:00',
      createdBy: 'CLIENT_SELF',
      confirmedBy: 'Valentina Ríos',
    },
    {
      id: 'apt-002',
      patientName: 'Esteban Morales Peña',
      patientPhone: '+57 314 987 6543',
      patientEmail: 'esteban.morales@hotmail.com',
      serviceId: 'srv-006',
      serviceName: 'Limpieza Facial Profunda + Punta Diamante',
      specialistId: 'usr-004',
      specialistName: 'Camila Herrera',
      date: '2026-09-12',
      timeSlot: '11:00',
      status: 'PENDING',
      notes: 'Requiere preparación dérmica previa a viaje.',
      createdAt: '2026-09-09T14:20:00',
      createdBy: 'CLIENT_SELF',
    },
    {
      id: 'apt-003',
      patientName: 'Carolina Echeverri',
      patientPhone: '+57 300 234 5678',
      patientEmail: 'caro.echeverri@yahoo.com',
      serviceId: 'srv-002',
      serviceName: 'Ácido Hialurónico Labios & Surcos',
      specialistId: 'usr-003',
      specialistName: 'Dr. Andrés Castaño',
      date: '2026-09-14',
      timeSlot: '14:00',
      status: 'PENDING',
      notes: 'Desea hidratación con efecto muy natural.',
      createdAt: '2026-09-09T16:45:00',
      createdBy: 'CLIENT_SELF',
    },
    {
      id: 'apt-004',
      patientName: 'Daniela Zuluaga Gómez',
      patientPhone: '+57 320 876 5432',
      patientEmail: 'daniela.zuluaga@gmail.com',
      serviceId: 'srv-005',
      serviceName: 'Drenaje Linfático Post-Quirúrgico',
      specialistId: 'usr-004',
      specialistName: 'Camila Herrera',
      date: '2026-09-15',
      timeSlot: '09:00',
      status: 'CONFIRMED',
      notes: 'Sesión 2 de 5 programadas posoperatorio.',
      createdAt: '2026-09-08T11:00:00',
      createdBy: 'STAFF',
      confirmedBy: 'Carolina Méndez',
    },
    {
      id: 'apt-005',
      patientName: 'Felipe Arboleda Ruiz',
      patientPhone: '+57 318 555 4321',
      patientEmail: 'felipe.arboleda@outlook.com',
      serviceId: 'srv-003',
      serviceName: 'Bioestimulador Radiesse',
      specialistId: 'usr-003',
      specialistName: 'Dr. Andrés Castaño',
      date: '2026-09-15',
      timeSlot: '15:00',
      status: 'CANCELLED',
      notes: 'Canceló por viaje imprevisto. Reagendará la próxima semana.',
      createdAt: '2026-09-07T09:30:00',
      createdBy: 'CLIENT_SELF',
    },
  ]);

  readonly appointments = this._appointments.asReadonly();

  // ─── Notifications ────────────────────────────────────────
  private readonly _notifications = signal<AppointmentNotification[]>([
    {
      id: 'notif-001',
      appointmentId: 'apt-003',
      type: 'NEW_APPOINTMENT',
      message: 'Nueva cita online agendada: Carolina Echeverri (Ácido Hialurónico)',
      patientName: 'Carolina Echeverri',
      serviceName: 'Ácido Hialurónico Labios & Surcos',
      timeSlot: '14:00',
      date: '2026-09-14',
      read: false,
      createdAt: '2026-09-09T16:45:00',
    },
    {
      id: 'notif-002',
      appointmentId: 'apt-002',
      type: 'NEW_APPOINTMENT',
      message: 'Nueva cita online agendada: Esteban Morales (Limpieza Facial Profunda)',
      patientName: 'Esteban Morales Peña',
      serviceName: 'Limpieza Facial Profunda + Punta Diamante',
      timeSlot: '11:00',
      date: '2026-09-12',
      read: false,
      createdAt: '2026-09-09T14:20:00',
    },
    {
      id: 'notif-003',
      appointmentId: 'apt-005',
      type: 'CANCELLATION',
      message: 'Cita cancelada por cliente: Felipe Arboleda (Radiesse)',
      patientName: 'Felipe Arboleda Ruiz',
      serviceName: 'Bioestimulador Radiesse',
      timeSlot: '15:00',
      date: '2026-09-15',
      read: true,
      createdAt: '2026-09-07T12:10:00',
    },
  ]);

  readonly notifications = this._notifications.asReadonly();

  readonly unreadNotificationsCount = computed(
    () => this._notifications().filter(n => !n.read).length
  );

  readonly pendingAppointments = computed(
    () => this._appointments().filter(a => a.status === 'PENDING')
  );

  readonly confirmedAppointments = computed(
    () => this._appointments().filter(a => a.status === 'CONFIRMED')
  );

  // ─── Availability Calculation ─────────────────────────────
  /**
   * Generates availability slots for a date (8:00 to 16:00).
   * Checks if an appointment is already booked in that slot.
   */
  getAvailabilitySlots(date: string, specialistId?: string): AvailabilitySlot[] {
    const existing = this._appointments().filter(
      a => a.date === date && a.status !== 'CANCELLED'
    );

    return this.dailyTimeSlots.map(time => {
      const match = existing.find(a => {
        const timeMatch = a.timeSlot === time;
        if (!timeMatch) return false;
        if (specialistId && specialistId !== 'any') {
          return a.specialistId === specialistId;
        }
        return true;
      });

      return {
        date,
        time,
        specialistId,
        isAvailable: !match,
        appointmentId: match ? match.id : undefined,
      };
    });
  }

  // ─── Actions ──────────────────────────────────────────────
  createAppointment(data: {
    patientName: string;
    patientPhone: string;
    patientEmail?: string;
    serviceId: string;
    specialistId?: string;
    date: string;
    timeSlot: string;
    notes?: string;
    createdBy?: 'CLIENT_SELF' | 'STAFF';
  }): Appointment {
    const srv = this.services.find(s => s.id === data.serviceId);
    const serviceName = srv ? srv.name : 'Servicio Especializado';

    let specialistName: string | undefined;
    if (data.specialistId && data.specialistId !== 'any') {
      const spec = this.specialists.find(sp => sp.id === data.specialistId);
      specialistName = spec?.name;
    } else {
      specialistName = srv?.recommendedSpecialistId === 'usr-004' ? 'Camila Herrera' : 'Dr. Andrés Castaño';
    }

    const newId = `apt-${Date.now().toString().slice(-4)}`;
    const newAppointment: Appointment = {
      id: newId,
      patientName: data.patientName.trim(),
      patientPhone: data.patientPhone.trim(),
      patientEmail: data.patientEmail?.trim() || undefined,
      serviceId: data.serviceId,
      serviceName,
      specialistId: data.specialistId || srv?.recommendedSpecialistId,
      specialistName,
      date: data.date,
      timeSlot: data.timeSlot,
      status: 'PENDING',
      notes: data.notes?.trim() || undefined,
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy || 'CLIENT_SELF',
    };

    // Add appointment to signal
    this._appointments.update(list => [newAppointment, ...list]);

    // Create unread notification for staff
    const notif: AppointmentNotification = {
      id: `notif-${Date.now().toString().slice(-4)}`,
      appointmentId: newId,
      type: 'NEW_APPOINTMENT',
      message: `Nueva cita agendada: ${newAppointment.patientName} (${newAppointment.serviceName})`,
      patientName: newAppointment.patientName,
      serviceName: newAppointment.serviceName,
      timeSlot: newAppointment.timeSlot,
      date: newAppointment.date,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this._notifications.update(list => [notif, ...list]);

    // Automatically store and update client profile in Clients module
    this.clientService.registerFromBooking({
      patientName: newAppointment.patientName,
      patientPhone: newAppointment.patientPhone,
      patientEmail: newAppointment.patientEmail,
      serviceId: newAppointment.serviceId,
      serviceName: newAppointment.serviceName,
      specialistId: newAppointment.specialistId,
      specialistName: newAppointment.specialistName,
      date: newAppointment.date,
      notes: newAppointment.notes,
      channel: data.createdBy === 'STAFF' ? 'DIRECTO' : 'LANDING_WEB',
    });

    // Audit trail log
    this.audit.log({
      userId: this.auth.currentUser()?.id || 'client-online',
      userName: data.createdBy === 'STAFF' ? (this.auth.currentUser()?.name || 'Staff') : newAppointment.patientName,
      userRole: data.createdBy === 'STAFF' ? 'Staff' : 'Cliente Web',
      entityType: 'APPOINTMENT',
      action: 'CREATE',
      entityId: newId,
      details: `Cita solicitada para ${newAppointment.patientName} (${newAppointment.serviceName}) el ${newAppointment.date} a las ${newAppointment.timeSlot} hrs.`,
    });

    return newAppointment;
  }

  confirmAppointment(id: string): void {
    const currentUser = this.auth.currentUser();
    const staffName = currentUser?.name || 'Administradora';

    this._appointments.update(list =>
      list.map(a => {
        if (a.id === id) {
          return {
            ...a,
            status: 'CONFIRMED',
            confirmedBy: staffName,
          };
        }
        return a;
      })
    );

    const apt = this._appointments().find(a => a.id === id);
    if (apt) {
      this.audit.log({
        userId: currentUser?.id || 'staff',
        userName: staffName,
        userRole: currentUser?.role || 'Administración',
        entityType: 'APPOINTMENT',
        action: 'UPDATE',
        entityId: id,
        details: `Cita ${id} confirmada formalmente por ${staffName} para el paciente ${apt.patientName}.`,
      });
    }
  }

  cancelAppointment(id: string, reason?: string): void {
    const currentUser = this.auth.currentUser();
    const staffName = currentUser?.name || 'Staff';

    this._appointments.update(list =>
      list.map(a => {
        if (a.id === id) {
          return {
            ...a,
            status: 'CANCELLED',
            notes: reason ? `${a.notes || ''} [Cancelada: ${reason}]` : a.notes,
          };
        }
        return a;
      })
    );

    const apt = this._appointments().find(a => a.id === id);
    if (apt) {
      // Add cancellation notification
      this._notifications.update(list => [
        {
          id: `notif-${Date.now().toString().slice(-4)}`,
          appointmentId: id,
          type: 'CANCELLATION',
          message: `Cita cancelada: ${apt.patientName} (${apt.serviceName})`,
          patientName: apt.patientName,
          serviceName: apt.serviceName,
          timeSlot: apt.timeSlot,
          date: apt.date,
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...list,
      ]);

      this.audit.log({
        userId: currentUser?.id || 'staff',
        userName: staffName,
        userRole: currentUser?.role || 'Staff',
        entityType: 'APPOINTMENT',
        action: 'VOID',
        entityId: id,
        details: `Cita ${id} cancelada. Motivo: ${reason || 'Sin motivo especificado'}.`,
      });
    }
  }

  logWhatsAppContact(appointmentId: string): void {
    const apt = this._appointments().find(a => a.id === appointmentId);
    if (!apt) return;

    const currentUser = this.auth.currentUser();
    this.audit.log({
      userId: currentUser?.id || 'staff',
      userName: currentUser?.name || 'Valentina Ríos',
      userRole: currentUser?.role || 'Administradora',
      entityType: 'APPOINTMENT',
      action: 'CONTACT_ATTEMPTED',
      entityId: appointmentId,
      details: `Contacto iniciado vía WhatsApp con ${apt.patientName} (${apt.patientPhone}) para la cita ${apt.serviceName} el ${apt.date}.`,
    });
  }

  markNotificationAsRead(id: string): void {
    this._notifications.update(list =>
      list.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }

  markAllNotificationsAsRead(): void {
    this._notifications.update(list => list.map(n => ({ ...n, read: true })));
  }

  getServiceById(id: string): PublicService | undefined {
    return this.services.find(s => s.id === id);
  }
}
