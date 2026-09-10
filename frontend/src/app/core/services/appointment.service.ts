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

  // ─── Mock Appointments (Agenda Clínica con Citas Pendientes y Confirmadas) ───
  private readonly _appointments = signal<Appointment[]>([
    // ── 2026-09-10 (Jueves) ─────────────────────────────────
    {
      id: 'apt-011',
      patientName: 'Carolina Echeverri',
      patientPhone: '+57 300 234 5678',
      patientEmail: 'caro.echeverri@yahoo.com',
      serviceId: 'srv-003',
      serviceName: 'Botox (Toxina Botulínica)',
      specialistId: 'usr-003',
      specialistName: 'Dr. Andrés Castaño',
      date: '2026-09-10',
      timeSlot: '08:00',
      status: 'CONFIRMED',
      notes: 'Frente completa y entrecejo.',
      createdAt: '2026-09-06T09:00:00',
      createdBy: 'CLIENT_SELF',
      confirmedBy: 'Valentina Ríos',
    },
    {
      id: 'apt-012',
      patientName: 'Daniela Zuluaga Gómez',
      patientPhone: '+57 320 876 5432',
      patientEmail: 'daniela.zuluaga@gmail.com',
      serviceId: 'srv-004',
      serviceName: 'Depilación Láser Médica',
      specialistId: 'usr-004',
      specialistName: 'Camila Herrera',
      date: '2026-09-10',
      timeSlot: '10:00',
      status: 'CONFIRMED',
      notes: 'Sesión 2 diodo piernas completas.',
      createdAt: '2026-09-06T10:00:00',
      createdBy: 'CLIENT_SELF',
      confirmedBy: 'Valentina Ríos',
    },
    {
      id: 'apt-013',
      patientName: 'Felipe Arboleda Ruiz',
      patientPhone: '+57 318 555 4321',
      patientEmail: 'felipe.arboleda@outlook.com',
      serviceId: 'srv-001',
      serviceName: 'Rinomodelación',
      specialistId: 'usr-003',
      specialistName: 'Dr. Andrés Castaño',
      date: '2026-09-10',
      timeSlot: '13:00',
      status: 'PENDING',
      notes: 'Consulta clínica inicial para perfilado de dorso nasal sin cirugía.',
      createdAt: '2026-09-09T18:30:00',
      createdBy: 'CLIENT_SELF',
    },
    {
      id: 'apt-014',
      patientName: 'Gabriela Uribe Posada',
      patientPhone: '+57 311 999 4433',
      patientEmail: 'gaby.uribe@gmail.com',
      serviceId: 'srv-006',
      serviceName: 'Cierre de Costillas & Remodelación',
      specialistId: 'usr-004',
      specialistName: 'Camila Herrera',
      date: '2026-09-10',
      timeSlot: '15:00',
      status: 'PENDING',
      notes: 'Solicitó información sobre protocolo reductor de cintura.',
      createdAt: '2026-09-09T20:15:00',
      createdBy: 'CLIENT_SELF',
    },

    // ── 2026-09-11 (Viernes) ────────────────────────────────
    {
      id: 'apt-015',
      patientName: 'Mateo Álvarez Rincón',
      patientPhone: '+57 313 777 6655',
      patientEmail: 'mateo.alvarez@gmail.com',
      serviceId: 'srv-005',
      serviceName: 'Limpieza Facial Profunda + Glow',
      specialistId: 'usr-004',
      specialistName: 'Camila Herrera',
      date: '2026-09-11',
      timeSlot: '09:00',
      status: 'CONFIRMED',
      notes: 'Higiene facial masculina con microdermoabrasión.',
      createdAt: '2026-09-07T11:00:00',
      createdBy: 'CLIENT_SELF',
      confirmedBy: 'Valentina Ríos',
    },
    {
      id: 'apt-016',
      patientName: 'Natalia Restrepo Cano',
      patientPhone: '+57 317 444 1122',
      patientEmail: 'naty.restrepo@gmail.com',
      serviceId: 'srv-002',
      serviceName: 'Labios (Perfilado & Relleno)',
      specialistId: 'usr-003',
      specialistName: 'Dr. Andrés Castaño',
      date: '2026-09-11',
      timeSlot: '11:00',
      status: 'PENDING',
      notes: 'Busca aumento de volumen sutil e hidratación profunda.',
      createdAt: '2026-09-09T21:40:00',
      createdBy: 'CLIENT_SELF',
    },
    {
      id: 'apt-017',
      patientName: 'Santiago Mejía',
      patientPhone: '+57 300 555 8899',
      patientEmail: 'santiago.mejia@gmail.com',
      serviceId: 'srv-004',
      serviceName: 'Depilación Láser Médica',
      specialistId: 'usr-004',
      specialistName: 'Camila Herrera',
      date: '2026-09-11',
      timeSlot: '14:00',
      status: 'CONFIRMED',
      notes: 'Espalda completa láser diodo.',
      createdAt: '2026-09-08T15:00:00',
      createdBy: 'CLIENT_SELF',
      confirmedBy: 'Valentina Ríos',
    },
    {
      id: 'apt-018',
      patientName: 'Vanessa Quintero',
      patientPhone: '+57 316 222 3344',
      patientEmail: 'vane.quintero@gmail.com',
      serviceId: 'srv-003',
      serviceName: 'Botox (Toxina Botulínica)',
      specialistId: 'usr-003',
      specialistName: 'Dr. Andrés Castaño',
      date: '2026-09-11',
      timeSlot: '16:00',
      status: 'PENDING',
      notes: 'Primera vez con toxina botulínica. Pendiente confirmar cita por WhatsApp.',
      createdAt: '2026-09-10T07:15:00',
      createdBy: 'CLIENT_SELF',
    },

    // ── 2026-09-12 (Sábado) ── (Horas Únicas de 08:00 a 16:00) ───
    {
      id: 'apt-001',
      patientName: 'Mariana Soto Valderrama',
      patientPhone: '+57 312 456 7890',
      patientEmail: 'mariana.soto@gmail.com',
      serviceId: 'srv-001',
      serviceName: 'Rinomodelación',
      specialistId: 'usr-003',
      specialistName: 'Dr. Andrés Castaño',
      date: '2026-09-12',
      timeSlot: '08:00',
      status: 'PENDING',
      notes: 'Valoración y armonización de dorso nasal. Agendada por formulario web.',
      createdAt: '2026-09-10T06:50:00',
      createdBy: 'CLIENT_SELF',
    },
    {
      id: 'apt-002',
      patientName: 'Camila Montoya Gil',
      patientPhone: '+57 301 987 1122',
      patientEmail: 'camila.montoya@gmail.com',
      serviceId: 'srv-005',
      serviceName: 'Limpieza Facial Profunda + Glow',
      specialistId: 'usr-004',
      specialistName: 'Camila Herrera',
      date: '2026-09-12',
      timeSlot: '09:00',
      status: 'CONFIRMED',
      notes: 'Higiene dérmica previa a evento social.',
      createdAt: '2026-09-09T08:30:00',
      createdBy: 'CLIENT_SELF',
      confirmedBy: 'Valentina Ríos',
    },
    {
      id: 'apt-003',
      patientName: 'Laura Ospina Vélez',
      patientPhone: '+57 310 555 7788',
      patientEmail: 'laura.ospina@outlook.com',
      serviceId: 'srv-002',
      serviceName: 'Labios (Perfilado & Relleno)',
      specialistId: 'usr-003',
      specialistName: 'Dr. Andrés Castaño',
      date: '2026-09-12',
      timeSlot: '10:00',
      status: 'PENDING',
      notes: 'Retoque semestral de volumen labial con ácido reticulado.',
      createdAt: '2026-09-10T07:30:00',
      createdBy: 'CLIENT_SELF',
    },
    {
      id: 'apt-004',
      patientName: 'Paola Gómez Restrepo',
      patientPhone: '+57 316 444 8899',
      patientEmail: 'paola.gomez@gmail.com',
      serviceId: 'srv-004',
      serviceName: 'Depilación Láser Médica',
      specialistId: 'usr-004',
      specialistName: 'Camila Herrera',
      date: '2026-09-12',
      timeSlot: '11:00',
      status: 'CONFIRMED',
      notes: 'Sesión 4 de protocolo diodo piernas completas.',
      createdAt: '2026-09-08T11:15:00',
      createdBy: 'CLIENT_SELF',
      confirmedBy: 'Valentina Ríos',
    },
    {
      id: 'apt-005',
      patientName: 'Esteban Morales Peña',
      patientPhone: '+57 314 987 6543',
      patientEmail: 'esteban.morales@hotmail.com',
      serviceId: 'srv-003',
      serviceName: 'Botox (Toxina Botulínica)',
      specialistId: 'usr-003',
      specialistName: 'Dr. Andrés Castaño',
      date: '2026-09-12',
      timeSlot: '12:00',
      status: 'CONFIRMED',
      notes: 'Tratamiento de tercio superior frente y entrecejo.',
      createdAt: '2026-09-09T14:20:00',
      createdBy: 'CLIENT_SELF',
      confirmedBy: 'Valentina Ríos',
    },
    {
      id: 'apt-006',
      patientName: 'Sofía Londoño Cardona',
      patientPhone: '+57 321 777 9900',
      patientEmail: 'sofia.londono@gmail.com',
      serviceId: 'srv-006',
      serviceName: 'Cierre de Costillas & Remodelación',
      specialistId: 'usr-004',
      specialistName: 'Camila Herrera',
      date: '2026-09-12',
      timeSlot: '13:00',
      status: 'PENDING',
      notes: 'Sesión 3 de estilización de cintura. Pendiente confirmación telefónica.',
      createdAt: '2026-09-10T08:05:00',
      createdBy: 'CLIENT_SELF',
    },
    {
      id: 'apt-007',
      patientName: 'Andrés Felipe Correa',
      patientPhone: '+57 302 333 4455',
      patientEmail: 'af.correa@empresa.com',
      serviceId: 'srv-001',
      serviceName: 'Rinomodelación',
      specialistId: 'usr-003',
      specialistName: 'Dr. Andrés Castaño',
      date: '2026-09-12',
      timeSlot: '14:00',
      status: 'CONFIRMED',
      notes: 'Revisión y perfeccionamiento nasal.',
      createdAt: '2026-09-07T16:00:00',
      createdBy: 'STAFF',
      confirmedBy: 'Carolina Méndez',
    },
    {
      id: 'apt-008',
      patientName: 'Isabella Botero Saldarriaga',
      patientPhone: '+57 315 222 1100',
      patientEmail: 'isa.botero@gmail.com',
      serviceId: 'srv-007',
      serviceName: 'Glúteos (Armonización & Firmeza)',
      specialistId: 'usr-004',
      specialistName: 'Camila Herrera',
      date: '2026-09-12',
      timeSlot: '15:00',
      status: 'PENDING',
      notes: 'Bioestimulación colágena glútea. Paciente solicita pago en clínica.',
      createdAt: '2026-09-10T08:12:00',
      createdBy: 'CLIENT_SELF',
    },
    {
      id: 'apt-009',
      patientName: 'Valeria Jaramillo Ochoa',
      patientPhone: '+57 318 666 5544',
      patientEmail: 'valeria.j@gmail.com',
      serviceId: 'srv-002',
      serviceName: 'Labios (Perfilado & Relleno)',
      specialistId: 'usr-003',
      specialistName: 'Dr. Andrés Castaño',
      date: '2026-09-12',
      timeSlot: '16:00',
      status: 'CONFIRMED',
      notes: 'Hidratación y arco de cupido.',
      createdAt: '2026-09-08T09:10:00',
      createdBy: 'CLIENT_SELF',
      confirmedBy: 'Valentina Ríos',
    },

    // ── 2026-09-14 (Lunes) ──────────────────────────────────
    {
      id: 'apt-010',
      patientName: 'Juliana Castro Henao',
      patientPhone: '+57 319 888 3322',
      patientEmail: 'juliana.castro@gmail.com',
      serviceId: 'srv-005',
      serviceName: 'Limpieza Facial Profunda + Glow',
      specialistId: 'usr-004',
      specialistName: 'Camila Herrera',
      date: '2026-09-14',
      timeSlot: '09:00',
      status: 'CONFIRMED',
      notes: 'Protocolo glow para sesión de fotos.',
      createdAt: '2026-09-08T12:40:00',
      createdBy: 'CLIENT_SELF',
      confirmedBy: 'Valentina Ríos',
    },
    {
      id: 'apt-019',
      patientName: 'Elena Rendón Villegas',
      patientPhone: '+57 301 666 7788',
      patientEmail: 'elena.rendon@gmail.com',
      serviceId: 'srv-001',
      serviceName: 'Rinomodelación',
      specialistId: 'usr-003',
      specialistName: 'Dr. Andrés Castaño',
      date: '2026-09-14',
      timeSlot: '10:00',
      status: 'PENDING',
      notes: 'Consulta médica sin cirugía. Requiere cotización formal.',
      createdAt: '2026-09-09T09:00:00',
      createdBy: 'CLIENT_SELF',
    },
    {
      id: 'apt-020',
      patientName: 'Mariana Duque',
      patientPhone: '+57 312 888 1199',
      patientEmail: 'mariana.duque@gmail.com',
      serviceId: 'srv-007',
      serviceName: 'Glúteos (Armonización & Firmeza)',
      specialistId: 'usr-004',
      specialistName: 'Camila Herrera',
      date: '2026-09-14',
      timeSlot: '12:00',
      status: 'CONFIRMED',
      notes: 'Sesión de mantenimiento.',
      createdAt: '2026-09-09T11:00:00',
      createdBy: 'CLIENT_SELF',
      confirmedBy: 'Valentina Ríos',
    },
    {
      id: 'apt-021',
      patientName: 'Alejandro Casas',
      patientPhone: '+57 314 333 2211',
      patientEmail: 'alejo.casas@gmail.com',
      serviceId: 'srv-003',
      serviceName: 'Botox (Toxina Botulínica)',
      specialistId: 'usr-003',
      specialistName: 'Dr. Andrés Castaño',
      date: '2026-09-14',
      timeSlot: '14:00',
      status: 'PENDING',
      notes: 'Toxina botulínica preventiva zona frontal.',
      createdAt: '2026-09-09T14:00:00',
      createdBy: 'CLIENT_SELF',
    },
    {
      id: 'apt-022',
      patientName: 'Lucía Tamayo',
      patientPhone: '+57 320 111 8877',
      patientEmail: 'lucia.tamayo@gmail.com',
      serviceId: 'srv-005',
      serviceName: 'Limpieza Facial Profunda + Glow',
      specialistId: 'usr-004',
      specialistName: 'Camila Herrera',
      date: '2026-09-14',
      timeSlot: '15:00',
      status: 'CONFIRMED',
      notes: 'Tratamiento facial hidratante.',
      createdAt: '2026-09-09T16:00:00',
      createdBy: 'CLIENT_SELF',
      confirmedBy: 'Valentina Ríos',
    },

    // ── 2026-09-15 (Martes) ─────────────────────────────────
    {
      id: 'apt-023',
      patientName: 'David Fernando Morales',
      patientPhone: '+57 315 789 4512',
      patientEmail: 'david.morales@corp.com',
      serviceId: 'srv-001',
      serviceName: 'Rinomodelación',
      specialistId: 'usr-003',
      specialistName: 'Dr. Andrés Castaño',
      date: '2026-09-15',
      timeSlot: '09:00',
      status: 'PENDING',
      notes: 'Armonización masculina de tabique nasal.',
      createdAt: '2026-09-10T07:55:00',
      createdBy: 'CLIENT_SELF',
    },
    {
      id: 'apt-024',
      patientName: 'Sara Manuela Vélez',
      patientPhone: '+57 302 444 9876',
      patientEmail: 'sara.velez@hotmail.com',
      serviceId: 'srv-006',
      serviceName: 'Cierre de Costillas & Remodelación',
      specialistId: 'usr-004',
      specialistName: 'Camila Herrera',
      date: '2026-09-15',
      timeSlot: '10:00',
      status: 'CONFIRMED',
      notes: 'Seguimiento de sesión 2.',
      createdAt: '2026-09-08T14:20:00',
      createdBy: 'CLIENT_SELF',
      confirmedBy: 'Valentina Ríos',
    },
    {
      id: 'apt-025',
      patientName: 'Manuela Higuita',
      patientPhone: '+57 317 654 3210',
      patientEmail: 'manuela.h@gmail.com',
      serviceId: 'srv-004',
      serviceName: 'Depilación Láser Médica',
      specialistId: 'usr-004',
      specialistName: 'Camila Herrera',
      date: '2026-09-15',
      timeSlot: '11:00',
      status: 'PENDING',
      notes: 'Sesión inicial axilas y rostro.',
      createdAt: '2026-09-10T08:00:00',
      createdBy: 'CLIENT_SELF',
    },
    {
      id: 'apt-026',
      patientName: 'Felipe Arboleda Ruiz',
      patientPhone: '+57 318 555 4321',
      patientEmail: 'felipe.arboleda@outlook.com',
      serviceId: 'srv-003',
      serviceName: 'Botox (Toxina Botulínica)',
      specialistId: 'usr-003',
      specialistName: 'Dr. Andrés Castaño',
      date: '2026-09-15',
      timeSlot: '15:00',
      status: 'CANCELLED',
      notes: 'Canceló por viaje imprevisto. Reagendará para la semana entrante.',
      createdAt: '2026-09-07T09:30:00',
      createdBy: 'CLIENT_SELF',
    },

    // ── 2026-09-16 (Miércoles) ──────────────────────────────
    {
      id: 'apt-027',
      patientName: 'Juan Camilo Cárdenas',
      patientPhone: '+57 310 321 6549',
      patientEmail: 'juan.cardenas@gmail.com',
      serviceId: 'srv-003',
      serviceName: 'Botox (Toxina Botulínica)',
      specialistId: 'usr-003',
      specialistName: 'Dr. Andrés Castaño',
      date: '2026-09-16',
      timeSlot: '08:00',
      status: 'PENDING',
      notes: 'Atenuación de líneas de expresión en entrecejo.',
      createdAt: '2026-09-10T07:45:00',
      createdBy: 'CLIENT_SELF',
    },
    {
      id: 'apt-028',
      patientName: 'Ana María Peláez',
      patientPhone: '+57 312 999 1122',
      patientEmail: 'ana.pelaez@gmail.com',
      serviceId: 'srv-005',
      serviceName: 'Limpieza Facial Profunda + Glow',
      specialistId: 'usr-004',
      specialistName: 'Camila Herrera',
      date: '2026-09-16',
      timeSlot: '11:00',
      status: 'CONFIRMED',
      notes: 'Tratamiento glow y velo de colágeno.',
      createdAt: '2026-09-08T16:10:00',
      createdBy: 'STAFF',
      confirmedBy: 'Carolina Méndez',
    },
    {
      id: 'apt-029',
      patientName: 'Tatiana Marín',
      patientPhone: '+57 316 777 8899',
      patientEmail: 'tatiana.marin@gmail.com',
      serviceId: 'srv-002',
      serviceName: 'Labios (Perfilado & Relleno)',
      specialistId: 'usr-003',
      specialistName: 'Dr. Andrés Castaño',
      date: '2026-09-16',
      timeSlot: '13:00',
      status: 'PENDING',
      notes: 'Primera sesión para definición de arco y comisuras.',
      createdAt: '2026-09-10T08:10:00',
      createdBy: 'CLIENT_SELF',
    },
    {
      id: 'apt-030',
      patientName: 'Carlos Eduardo Barrientos',
      patientPhone: '+57 301 555 4433',
      patientEmail: 'carlos.barrientos@gmail.com',
      serviceId: 'srv-004',
      serviceName: 'Depilación Láser Médica',
      specialistId: 'usr-004',
      specialistName: 'Camila Herrera',
      date: '2026-09-16',
      timeSlot: '16:00',
      status: 'CONFIRMED',
      notes: 'Depilación médica barba y cuello.',
      createdAt: '2026-09-09T13:40:00',
      createdBy: 'CLIENT_SELF',
      confirmedBy: 'Valentina Ríos',
    },

    // ── 2026-09-17 (Jueves) ─────────────────────────────────
    {
      id: 'apt-031',
      patientName: 'Melissa Agudelo',
      patientPhone: '+57 314 888 7766',
      patientEmail: 'meli.agudelo@gmail.com',
      serviceId: 'srv-007',
      serviceName: 'Glúteos (Armonización & Firmeza)',
      specialistId: 'usr-004',
      specialistName: 'Camila Herrera',
      date: '2026-09-17',
      timeSlot: '09:00',
      status: 'PENDING',
      notes: 'Protocolo de tonificación y bioestimulación.',
      createdAt: '2026-09-10T06:30:00',
      createdBy: 'CLIENT_SELF',
    },
    {
      id: 'apt-032',
      patientName: 'Sebastián Herrera',
      patientPhone: '+57 320 222 3311',
      patientEmail: 'sebas.herrera@outlook.com',
      serviceId: 'srv-001',
      serviceName: 'Rinomodelación',
      specialistId: 'usr-003',
      specialistName: 'Dr. Andrés Castaño',
      date: '2026-09-17',
      timeSlot: '12:00',
      status: 'CONFIRMED',
      notes: 'Evaluación y procedimiento programado.',
      createdAt: '2026-09-08T18:00:00',
      createdBy: 'STAFF',
      confirmedBy: 'Valentina Ríos',
    },
    {
      id: 'apt-033',
      patientName: 'Verónica Salazar',
      patientPhone: '+57 311 444 3322',
      patientEmail: 'vero.salazar@gmail.com',
      serviceId: 'srv-002',
      serviceName: 'Labios (Perfilado & Relleno)',
      specialistId: 'usr-003',
      specialistName: 'Dr. Andrés Castaño',
      date: '2026-09-17',
      timeSlot: '14:00',
      status: 'PENDING',
      notes: 'Retoque de volumen.',
      createdAt: '2026-09-10T08:00:00',
      createdBy: 'CLIENT_SELF',
    },

    // ── 2026-09-18 (Viernes) ────────────────────────────────
    {
      id: 'apt-034',
      patientName: 'Claudia Patricia Gómez',
      patientPhone: '+57 315 999 8877',
      patientEmail: 'claudia.gomez@gmail.com',
      serviceId: 'srv-003',
      serviceName: 'Botox (Toxina Botulínica)',
      specialistId: 'usr-003',
      specialistName: 'Dr. Andrés Castaño',
      date: '2026-09-18',
      timeSlot: '10:00',
      status: 'CONFIRMED',
      notes: 'Toxina botulínica tercio superior completo.',
      createdAt: '2026-09-08T10:30:00',
      createdBy: 'CLIENT_SELF',
      confirmedBy: 'Valentina Ríos',
    },
    {
      id: 'apt-035',
      patientName: 'Andrea Buitrago',
      patientPhone: '+57 300 111 2233',
      patientEmail: 'andrea.buitrago@gmail.com',
      serviceId: 'srv-006',
      serviceName: 'Cierre de Costillas & Remodelación',
      specialistId: 'usr-004',
      specialistName: 'Camila Herrera',
      date: '2026-09-18',
      timeSlot: '13:00',
      status: 'PENDING',
      notes: 'Consulta de valoración para remodelación de cintura.',
      createdAt: '2026-09-10T08:08:00',
      createdBy: 'CLIENT_SELF',
    },
    {
      id: 'apt-036',
      patientName: 'María Alejandra Cano',
      patientPhone: '+57 318 333 4455',
      patientEmail: 'aleja.cano@gmail.com',
      serviceId: 'srv-005',
      serviceName: 'Limpieza Facial Profunda + Glow',
      specialistId: 'usr-004',
      specialistName: 'Camila Herrera',
      date: '2026-09-18',
      timeSlot: '15:00',
      status: 'CONFIRMED',
      notes: 'Limpieza con máscara LED y suero nutritivo.',
      createdAt: '2026-09-09T17:20:00',
      createdBy: 'CLIENT_SELF',
      confirmedBy: 'Valentina Ríos',
    },
  ]);

  readonly appointments = this._appointments.asReadonly();

  // ─── Notifications ────────────────────────────────────────
  private readonly _notifications = signal<AppointmentNotification[]>([
    {
      id: 'notif-001',
      appointmentId: 'apt-001',
      type: 'NEW_APPOINTMENT',
      message: 'Nueva cita online por confirmar: Mariana Soto (Rinomodelación)',
      patientName: 'Mariana Soto Valderrama',
      serviceName: 'Rinomodelación',
      timeSlot: '08:00',
      date: '2026-09-12',
      read: false,
      createdAt: '2026-09-10T06:50:00',
    },
    {
      id: 'notif-002',
      appointmentId: 'apt-003',
      type: 'NEW_APPOINTMENT',
      message: 'Nueva cita online por confirmar: Laura Ospina (Labios)',
      patientName: 'Laura Ospina Vélez',
      serviceName: 'Labios (Perfilado & Relleno)',
      timeSlot: '10:00',
      date: '2026-09-12',
      read: false,
      createdAt: '2026-09-10T07:30:00',
    },
    {
      id: 'notif-003',
      appointmentId: 'apt-008',
      type: 'NEW_APPOINTMENT',
      message: 'Nueva cita online por confirmar: Isabella Botero (Glúteos)',
      patientName: 'Isabella Botero Saldarriaga',
      serviceName: 'Glúteos (Armonización & Firmeza)',
      timeSlot: '15:00',
      date: '2026-09-12',
      read: false,
      createdAt: '2026-09-10T08:12:00',
    },
    {
      id: 'notif-004',
      appointmentId: 'apt-026',
      type: 'CANCELLATION',
      message: 'Cita cancelada por cliente: Felipe Arboleda (Botox)',
      patientName: 'Felipe Arboleda Ruiz',
      serviceName: 'Botox (Toxina Botulínica)',
      timeSlot: '15:00',
      date: '2026-09-15',
      read: true,
      createdAt: '2026-09-07T09:30:00',
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
