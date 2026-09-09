import { Injectable, signal, computed } from '@angular/core';
import { Patient, Treatment, ClinicalSession, MedicalRecord, TreatmentCategory } from '../models/patient.model';
import { PaymentRecord, ExpenseItem, AccountBalance, FinancialSummary } from '../models/finance.model';

@Injectable({ providedIn: 'root' })
export class MockDataService {

  // ─── Patients ───────────────────────────────────────────────
  private readonly _patients = signal<Patient[]>([
    {
      id: 'pat-001',
      firstName: 'María Alejandra',
      lastName: 'González Restrepo',
      documentId: '1.032.456.789',
      phone: '+57 310 456 7890',
      email: 'maria.gonzalez@email.com',
      birthDate: '1992-03-15',
      assignedSpecialistId: 'usr-004',
      createdAt: '2026-01-10',
      treatments: [
        {
          id: 'trt-001',
          name: 'Hidrolipoclasia + Radiofrecuencia Corporal',
          category: 'corporal-cosmetologia',
          totalSessions: 10,
          completedSessions: 6,
          totalCost: 2800000,
          totalPaid: 1800000,
          status: 'active',
        },
        {
          id: 'trt-002',
          name: 'Toxina Botulínica – Tercio Superior',
          category: 'medico-no-invasivo',
          totalSessions: 1,
          completedSessions: 1,
          totalCost: 650000,
          totalPaid: 650000,
          status: 'completed',
        },
      ],
      clinicalHistory: [
        { id: 'cs-001', treatmentId: 'trt-001', treatmentName: 'Hidrolipoclasia + RF Corporal', sessionNumber: 6, date: '2026-08-28', notes: 'Reducción de 2cm en perímetro abdominal. Paciente tolera bien el procedimiento. Se recomienda continuar con plan nutricional.', specialistName: 'Camila Herrera', specialistId: 'usr-004' },
        { id: 'cs-002', treatmentId: 'trt-001', treatmentName: 'Hidrolipoclasia + RF Corporal', sessionNumber: 5, date: '2026-08-14', notes: 'Sesión sin novedades. Buena evolución. Piel firme, sin equimosis.', specialistName: 'Camila Herrera', specialistId: 'usr-004' },
        { id: 'cs-003', treatmentId: 'trt-002', treatmentName: 'Toxina Botulínica – Tercio Superior', sessionNumber: 1, date: '2026-07-20', notes: 'Aplicación de 50 unidades. Frente, entrecejo y patas de gallo. Sin complicaciones.', specialistName: 'Dr. Andrés Castaño', specialistId: 'usr-003' },
        { id: 'cs-004', treatmentId: 'trt-001', treatmentName: 'Hidrolipoclasia + RF Corporal', sessionNumber: 4, date: '2026-07-30', notes: 'Buena respuesta al tratamiento. Sin efectos adversos.', specialistName: 'Camila Herrera', specialistId: 'usr-004' },
        { id: 'cs-005', treatmentId: 'trt-001', treatmentName: 'Hidrolipoclasia + RF Corporal', sessionNumber: 3, date: '2026-07-16', notes: 'Sesión estándar. Paciente reporta satisfacción con resultados parciales.', specialistName: 'Camila Herrera', specialistId: 'usr-004' },
      ],
    },
    {
      id: 'pat-002',
      firstName: 'Laura',
      lastName: 'Martínez Ochoa',
      documentId: '1.015.234.567',
      phone: '+57 315 789 0123',
      email: 'laura.martinez@email.com',
      birthDate: '1988-07-22',
      assignedSpecialistId: 'usr-003',
      createdAt: '2026-02-05',
      treatments: [
        {
          id: 'trt-003',
          name: 'Ácido Hialurónico – Labios y Surcos',
          category: 'medico-no-invasivo',
          totalSessions: 2,
          completedSessions: 1,
          totalCost: 1200000,
          totalPaid: 600000,
          status: 'active',
        },
        {
          id: 'trt-004',
          name: 'Limpieza Facial Profunda + Peeling',
          category: 'corporal-cosmetologia',
          totalSessions: 6,
          completedSessions: 4,
          totalCost: 900000,
          totalPaid: 900000,
          status: 'active',
        },
      ],
      clinicalHistory: [
        { id: 'cs-006', treatmentId: 'trt-003', treatmentName: 'Ácido Hialurónico – Labios y Surcos', sessionNumber: 1, date: '2026-08-10', notes: 'Aplicación en labio superior e inferior. 1ml de ácido hialurónico reticulado. Resultado natural. Control en 15 días.', specialistName: 'Dr. Andrés Castaño', specialistId: 'usr-003' },
        { id: 'cs-007', treatmentId: 'trt-004', treatmentName: 'Limpieza Facial Profunda + Peeling', sessionNumber: 4, date: '2026-08-05', notes: 'Peeling químico superficial con ácido glicólico al 30%. Piel reactiva normal. Indicaciones de protector solar.', specialistName: 'Camila Herrera', specialistId: 'usr-004' },
      ],
      medicalRecord: {
        antecedentesMedicos: 'Sin antecedentes patológicos relevantes. Niega cirugías faciales previas.',
        alergias: 'Alergia estacional leve (polen). Niega alergia a anestésicos locales ni a fármacos.',
        motivoConsulta: 'Atenuación de líneas de expresión peribucales y aumento sutil de volumen con hidratación en labios.',
        diagnosticoEstetico: 'Envejecimiento cutáneo Glogau II. Leve pérdida de proyección en bermellón labial y surcos nasogenianos grado 2.',
        zonasTratamiento: 'Tercio inferior: bermellón labial superior e inferior, y surcos nasogenianos bilaterales.',
        contraindicaciones: 'Ninguna contraindicación médica detectada para rellenos ni bioestimuladores.',
        cuidadosPost: 'Aplicar frío local las primeras 6 horas. No masajear intensamente. Evitar sauna, piscina y ejercicio intenso 24h.',
        registradoPor: 'Dr. Andrés Castaño',
        fechaRegistro: '2026-02-05',
        ultimaActualizacion: '2026-08-10',
      },
    },
    {
      id: 'pat-003',
      firstName: 'Andrea',
      lastName: 'López Vargas',
      documentId: '1.020.678.345',
      phone: '+57 320 123 4567',
      email: 'andrea.lopez@email.com',
      birthDate: '1995-11-30',
      assignedSpecialistId: 'usr-004',
      createdAt: '2026-03-18',
      treatments: [
        {
          id: 'trt-005',
          name: 'Masaje Reductivo + Maderoterapia',
          category: 'corporal-cosmetologia',
          totalSessions: 12,
          completedSessions: 12,
          totalCost: 1800000,
          totalPaid: 1800000,
          status: 'completed',
        },
      ],
      clinicalHistory: [
        { id: 'cs-008', treatmentId: 'trt-005', treatmentName: 'Masaje Reductivo + Maderoterapia', sessionNumber: 12, date: '2026-08-20', notes: 'Última sesión del plan. Reducción total de 8cm. Paciente muy satisfecha con resultados.', specialistName: 'Camila Herrera', specialistId: 'usr-004' },
      ],
    },
    {
      id: 'pat-004',
      firstName: 'Daniela',
      lastName: 'Ramírez Torres',
      documentId: '1.045.891.234',
      phone: '+57 301 567 8901',
      email: 'daniela.ramirez@email.com',
      birthDate: '1990-05-08',
      assignedSpecialistId: 'usr-003',
      createdAt: '2026-04-22',
      treatments: [
        {
          id: 'trt-006',
          name: 'Plasma Rico en Plaquetas – Facial',
          category: 'medico-no-invasivo',
          totalSessions: 3,
          completedSessions: 2,
          totalCost: 1500000,
          totalPaid: 1000000,
          status: 'active',
        },
        {
          id: 'trt-007',
          name: 'Dermapen + Vitaminas',
          category: 'corporal-cosmetologia',
          totalSessions: 4,
          completedSessions: 1,
          totalCost: 800000,
          totalPaid: 200000,
          status: 'active',
        },
      ],
      clinicalHistory: [
        { id: 'cs-009', treatmentId: 'trt-006', treatmentName: 'Plasma Rico en Plaquetas – Facial', sessionNumber: 2, date: '2026-09-01', notes: 'Segunda sesión de PRP. Mejora visible en textura y luminosidad de la piel.', specialistName: 'Dr. Andrés Castaño', specialistId: 'usr-003' },
        { id: 'cs-010', treatmentId: 'trt-007', treatmentName: 'Dermapen + Vitaminas', sessionNumber: 1, date: '2026-08-25', notes: 'Primera sesión de microneedling. Profundidad 1.0mm. Aplicación de coctel vitamínico. Enrojecimiento esperado 24-48h.', specialistName: 'Camila Herrera', specialistId: 'usr-004' },
      ],
    },
    {
      id: 'pat-005',
      firstName: 'Sofía',
      lastName: 'Hernández Mejía',
      documentId: '1.098.765.432',
      phone: '+57 312 345 6789',
      email: 'sofia.hernandez@email.com',
      birthDate: '1985-01-17',
      assignedSpecialistId: 'usr-004',
      createdAt: '2026-05-10',
      treatments: [
        {
          id: 'trt-008',
          name: 'Carboxiterapia Corporal',
          category: 'corporal-cosmetologia',
          totalSessions: 8,
          completedSessions: 3,
          totalCost: 1600000,
          totalPaid: 600000,
          status: 'active',
        },
      ],
      clinicalHistory: [
        { id: 'cs-011', treatmentId: 'trt-008', treatmentName: 'Carboxiterapia Corporal', sessionNumber: 3, date: '2026-08-30', notes: 'Tercera sesión en zona de muslos y glúteos. Buena tolerancia. Se observa mejora en celulitis grado II.', specialistName: 'Camila Herrera', specialistId: 'usr-004' },
      ],
    },
    {
      id: 'pat-006',
      firstName: 'Juliana',
      lastName: 'Castro Peña',
      documentId: '1.078.543.210',
      phone: '+57 318 901 2345',
      email: 'juliana.castro@email.com',
      birthDate: '1993-09-12',
      assignedSpecialistId: 'usr-003',
      createdAt: '2026-06-01',
      treatments: [
        {
          id: 'trt-009',
          name: 'Rinomodelación con Ácido Hialurónico',
          category: 'medico-no-invasivo',
          totalSessions: 1,
          completedSessions: 0,
          totalCost: 1100000,
          totalPaid: 550000,
          status: 'active',
        },
        {
          id: 'trt-010',
          name: 'Microblading Cejas',
          category: 'corporal-cosmetologia',
          totalSessions: 2,
          completedSessions: 2,
          totalCost: 500000,
          totalPaid: 500000,
          status: 'completed',
        },
      ],
      clinicalHistory: [
        { id: 'cs-012', treatmentId: 'trt-010', treatmentName: 'Microblading Cejas', sessionNumber: 2, date: '2026-08-15', notes: 'Retoque de microblading. Color y forma definidos. Paciente satisfecha con diseño final.', specialistName: 'Camila Herrera', specialistId: 'usr-004' },
      ],
    },
    {
      id: 'pat-007',
      firstName: 'Camila',
      lastName: 'Vélez Arango',
      documentId: '1.056.789.012',
      phone: '+57 305 678 9012',
      email: 'camila.velez@email.com',
      birthDate: '1997-12-05',
      assignedSpecialistId: 'usr-004',
      createdAt: '2026-07-14',
      treatments: [
        {
          id: 'trt-011',
          name: 'Ultracavitación + Presoterapia',
          category: 'corporal-cosmetologia',
          totalSessions: 8,
          completedSessions: 2,
          totalCost: 1400000,
          totalPaid: 350000,
          status: 'active',
        },
      ],
      clinicalHistory: [
        { id: 'cs-013', treatmentId: 'trt-011', treatmentName: 'Ultracavitación + Presoterapia', sessionNumber: 2, date: '2026-09-05', notes: 'Sesión combinada. Buen drenaje linfático posterior. Paciente refiere sensación de ligereza.', specialistName: 'Camila Herrera', specialistId: 'usr-004' },
      ],
    },
    {
      id: 'pat-008',
      firstName: 'Isabella',
      lastName: 'Moreno Díaz',
      documentId: '1.034.567.890',
      phone: '+57 322 012 3456',
      email: 'isabella.moreno@email.com',
      birthDate: '1991-04-28',
      assignedSpecialistId: 'usr-003',
      createdAt: '2026-08-01',
      treatments: [
        {
          id: 'trt-012',
          name: 'Toxina Botulínica – Full Face',
          category: 'medico-no-invasivo',
          totalSessions: 1,
          completedSessions: 1,
          totalCost: 850000,
          totalPaid: 850000,
          status: 'completed',
        },
        {
          id: 'trt-013',
          name: 'Bioestimulación con Polinucleótidos',
          category: 'medico-no-invasivo',
          totalSessions: 3,
          completedSessions: 0,
          totalCost: 1350000,
          totalPaid: 450000,
          status: 'active',
        },
      ],
      clinicalHistory: [
        { id: 'cs-014', treatmentId: 'trt-012', treatmentName: 'Toxina Botulínica – Full Face', sessionNumber: 1, date: '2026-08-18', notes: 'Aplicación de 64 unidades. Frente, entrecejo, patas de gallo y maseteros. Técnica intradérmica. Sin complicaciones.', specialistName: 'Dr. Andrés Castaño', specialistId: 'usr-003' },
      ],
    },
  ]);

  // ─── Payments ───────────────────────────────────────────────
  private readonly _payments = signal<PaymentRecord[]>([
    { id: 'pay-001', patientId: 'pat-001', treatmentId: 'trt-001', amount: 1000000, method: 'transferencia', date: '2026-01-15', registeredBy: 'Valentina Ríos' },
    { id: 'pay-002', patientId: 'pat-001', treatmentId: 'trt-001', amount: 800000, method: 'efectivo', date: '2026-04-20', registeredBy: 'Valentina Ríos' },
    { id: 'pay-003', patientId: 'pat-001', treatmentId: 'trt-002', amount: 650000, method: 'tarjeta', date: '2026-07-20', registeredBy: 'Valentina Ríos' },
    { id: 'pay-004', patientId: 'pat-002', treatmentId: 'trt-003', amount: 600000, method: 'transferencia', date: '2026-08-10', registeredBy: 'Valentina Ríos' },
    { id: 'pay-005', patientId: 'pat-002', treatmentId: 'trt-004', amount: 900000, method: 'efectivo', date: '2026-02-10', registeredBy: 'Valentina Ríos' },
    { id: 'pay-006', patientId: 'pat-003', treatmentId: 'trt-005', amount: 1800000, method: 'transferencia', date: '2026-03-20', registeredBy: 'Valentina Ríos' },
    { id: 'pay-007', patientId: 'pat-004', treatmentId: 'trt-006', amount: 1000000, method: 'tarjeta', date: '2026-04-25', registeredBy: 'Valentina Ríos' },
    { id: 'pay-008', patientId: 'pat-004', treatmentId: 'trt-007', amount: 200000, method: 'efectivo', date: '2026-08-25', registeredBy: 'Valentina Ríos' },
    { id: 'pay-009', patientId: 'pat-005', treatmentId: 'trt-008', amount: 600000, method: 'transferencia', date: '2026-05-15', registeredBy: 'Valentina Ríos' },
    { id: 'pay-010', patientId: 'pat-006', treatmentId: 'trt-009', amount: 550000, method: 'efectivo', date: '2026-06-05', registeredBy: 'Valentina Ríos' },
    { id: 'pay-011', patientId: 'pat-006', treatmentId: 'trt-010', amount: 500000, method: 'tarjeta', date: '2026-07-01', registeredBy: 'Valentina Ríos' },
    { id: 'pay-012', patientId: 'pat-007', treatmentId: 'trt-011', amount: 350000, method: 'efectivo', date: '2026-07-14', registeredBy: 'Valentina Ríos' },
    { id: 'pay-013', patientId: 'pat-008', treatmentId: 'trt-012', amount: 850000, method: 'transferencia', date: '2026-08-01', registeredBy: 'Valentina Ríos' },
    { id: 'pay-014', patientId: 'pat-008', treatmentId: 'trt-013', amount: 450000, method: 'tarjeta', date: '2026-08-01', registeredBy: 'Valentina Ríos' },
  ]);

  // ─── Expenses ───────────────────────────────────────────────
  private readonly _expenses = signal<ExpenseItem[]>([
    { id: 'exp-001', concept: 'Ácido Hialurónico Reticulado (10 jeringas)', category: 'insumo-medico', amount: 3500000, date: '2026-08-01', registeredBy: 'Carolina Méndez' },
    { id: 'exp-002', concept: 'Toxina Botulínica 100U (5 frascos)', category: 'insumo-medico', amount: 2200000, date: '2026-08-01', registeredBy: 'Carolina Méndez' },
    { id: 'exp-003', concept: 'Gel conductor ultrasonido (12 unidades)', category: 'insumo-medico', amount: 180000, date: '2026-08-05', registeredBy: 'Valentina Ríos' },
    { id: 'exp-004', concept: 'Guantes estériles y material desechable', category: 'insumo-medico', amount: 320000, date: '2026-08-10', registeredBy: 'Valentina Ríos' },
    { id: 'exp-005', concept: 'Arriendo local mes de Agosto', category: 'operativo', amount: 4500000, date: '2026-08-01', registeredBy: 'Carolina Méndez' },
    { id: 'exp-006', concept: 'Servicios públicos Agosto', category: 'operativo', amount: 680000, date: '2026-08-15', registeredBy: 'Carolina Méndez' },
    { id: 'exp-007', concept: 'Plataforma de agendamiento mensual', category: 'administrativo', amount: 150000, date: '2026-08-01', registeredBy: 'Valentina Ríos' },
    { id: 'exp-008', concept: 'Kits de peeling químico (6 unidades)', category: 'insumo-medico', amount: 480000, date: '2026-08-20', registeredBy: 'Valentina Ríos' },
    { id: 'exp-009', concept: 'Mantenimiento equipo radiofrecuencia', category: 'operativo', amount: 350000, date: '2026-08-25', registeredBy: 'Carolina Méndez' },
    { id: 'exp-010', concept: 'Papelería y suministros de oficina', category: 'administrativo', amount: 95000, date: '2026-09-01', registeredBy: 'Valentina Ríos' },
    { id: 'exp-011', concept: 'Agujas 30G y microcánulas para relleno', category: 'insumo-medico', amount: 420000, date: '2026-09-02', registeredBy: 'Dr. Andrés Castaño' },
    { id: 'exp-012', concept: 'Aceites esenciales y cremas reductoras', category: 'insumo-medico', amount: 260000, date: '2026-09-03', registeredBy: 'Camila Herrera' },
    { id: 'exp-013', concept: 'Publicidad digital en redes sociales', category: 'operativo', amount: 600000, date: '2026-09-04', registeredBy: 'Carolina Méndez' },
    { id: 'exp-014', concept: 'Servicio de lavandería y toallas clínicas', category: 'operativo', amount: 210000, date: '2026-09-05', registeredBy: 'Valentina Ríos' },
    { id: 'exp-015', concept: 'Software de historia clínica y facturación DIAN', category: 'administrativo', amount: 280000, date: '2026-09-06', registeredBy: 'Carolina Méndez' },
    { id: 'exp-016', concept: 'Anestésico tópico en crema (5 tubos)', category: 'insumo-medico', amount: 190000, date: '2026-09-07', registeredBy: 'Dr. Andrés Castaño' },
  ]);

  // ─── Public Accessors ──────────────────────────────────────

  readonly patients = this._patients.asReadonly();
  readonly payments = this._payments.asReadonly();
  readonly expenses = this._expenses.asReadonly();

  readonly totalCollected = computed(() =>
    this._payments().reduce((sum, p) => sum + p.amount, 0)
  );

  readonly totalExpenses = computed(() =>
    this._expenses().reduce((sum, e) => sum + e.amount, 0)
  );

  readonly financialSummary = computed<FinancialSummary>(() => ({
    totalCollected: this.totalCollected(),
    totalExpenses: this.totalExpenses(),
    netBalance: this.totalCollected() - this.totalExpenses(),
  }));

  // ─── Methods ────────────────────────────────────────────────

  getPatientById(id: string): Patient | undefined {
    return this._patients().find(p => p.id === id);
  }

  getPatientsBySpecialist(specialistId: string): Patient[] {
    return this._patients().filter(p => p.assignedSpecialistId === specialistId);
  }

  getPaymentsByPatient(patientId: string): PaymentRecord[] {
    return this._payments().filter(p => p.patientId === patientId);
  }

  getAccountBalance(patientId: string): AccountBalance {
    const patient = this.getPatientById(patientId);
    if (!patient) {
      return { totalCost: 0, totalPaid: 0, pendingBalance: 0 };
    }
    const totalCost = patient.treatments.reduce((sum, t) => sum + t.totalCost, 0);
    const totalPaid = patient.treatments.reduce((sum, t) => sum + t.totalPaid, 0);
    return {
      totalCost,
      totalPaid,
      pendingBalance: totalCost - totalPaid,
    };
  }

  addPayment(payment: Omit<PaymentRecord, 'id'>): void {
    const newPayment: PaymentRecord = {
      ...payment,
      id: `pay-${String(this._payments().length + 1).padStart(3, '0')}`,
    };

    this._payments.update(payments => [...payments, newPayment]);

    // Update the treatment's totalPaid
    this._patients.update(patients =>
      patients.map(p => {
        if (p.id !== payment.patientId) return p;
        return {
          ...p,
          treatments: p.treatments.map(t => {
            if (t.id !== payment.treatmentId) return t;
            return { ...t, totalPaid: t.totalPaid + payment.amount };
          }),
        };
      })
    );
  }

  addExpense(expense: Omit<ExpenseItem, 'id'>): void {
    const newExpense: ExpenseItem = {
      ...expense,
      id: `exp-${String(this._expenses().length + 1).padStart(3, '0')}`,
    };
    this._expenses.update(expenses => [...expenses, newExpense]);
  }

  addClinicalEvolution(patientId: string, evolution: Omit<ClinicalSession, 'id'>): void {
    const newSession: ClinicalSession = {
      ...evolution,
      id: `cs-${Date.now()}`,
    };

    this._patients.update(patients =>
      patients.map(p => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          clinicalHistory: [newSession, ...p.clinicalHistory],
          treatments: p.treatments.map(t => {
            if (t.id !== evolution.treatmentId) return t;
            const updatedCompleted = Math.min(t.totalSessions, t.completedSessions + 1);
            return {
              ...t,
              completedSessions: updatedCompleted,
              status: updatedCompleted >= t.totalSessions ? 'completed' : t.status,
            };
          }),
        };
      })
    );
  }

  saveMedicalRecord(patientId: string, record: MedicalRecord): void {
    this._patients.update(patients =>
      patients.map(p => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          medicalRecord: {
            ...record,
            ultimaActualizacion: new Date().toISOString().split('T')[0],
          },
        };
      })
    );
  }

  prescribeTreatment(
    patientId: string,
    treatmentData: {
      name: string;
      category: TreatmentCategory;
      totalSessions: number;
      totalCost: number;
      dosage?: string;
      prescriptionNotes?: string;
    },
    doctorName: string,
    doctorId: string
  ): void {
    const newTreatmentId = `trt-${Date.now()}`;
    const newTreatment: Treatment = {
      id: newTreatmentId,
      name: treatmentData.name,
      category: treatmentData.category,
      totalSessions: treatmentData.totalSessions,
      completedSessions: 0,
      totalCost: treatmentData.totalCost,
      totalPaid: 0,
      status: 'active',
      dosage: treatmentData.dosage,
      prescriptionNotes: treatmentData.prescriptionNotes,
    };

    const prescriptionSession: ClinicalSession = {
      id: `cs-${Date.now()}`,
      treatmentId: newTreatmentId,
      treatmentName: treatmentData.name,
      sessionNumber: 0,
      date: new Date().toISOString().split('T')[0],
      notes: `[Formulación Médica]: ${treatmentData.name}. ${treatmentData.dosage ? 'Dosis/Zona: ' + treatmentData.dosage + '. ' : ''}${treatmentData.prescriptionNotes ? 'Indicaciones: ' + treatmentData.prescriptionNotes : ''}`,
      specialistName: doctorName,
      specialistId: doctorId,
    };

    this._patients.update(patients =>
      patients.map(p => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          treatments: [newTreatment, ...p.treatments],
          clinicalHistory: [prescriptionSession, ...p.clinicalHistory],
        };
      })
    );
  }
}
