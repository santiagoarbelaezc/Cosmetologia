import { Injectable, signal, computed } from '@angular/core';
import { AuditLogEntry, AuditEntityType, AuditAction } from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly _entries = signal<AuditLogEntry[]>([
    {
      id: 'aud-012',
      timestamp: '2026-09-09T17:10:05',
      userId: 'usr-003',
      userName: 'Dr. Andrés Castaño',
      userRole: 'Médico',
      entityType: 'TREATMENT',
      action: 'CREATE',
      entityId: 'cs-014',
      details: 'Registro de sesión de evolución clínica #1 (Toxina Botulínica – Full Face) para Isabella Moreno Díaz. Aplicación de 64 unidades sin complicaciones.',
    },
    {
      id: 'aud-011',
      timestamp: '2026-09-09T16:35:40',
      userId: 'usr-004',
      userName: 'Camila Herrera',
      userRole: 'Cosmetóloga',
      entityType: 'TREATMENT',
      action: 'CREATE',
      entityId: 'cs-001',
      details: 'Registro de sesión de evolución clínica #6 (Hidrolipoclasia + RF Corporal) para María Alejandra González. Reducción de 2cm en perímetro abdominal.',
    },
    {
      id: 'aud-010',
      timestamp: '2026-09-09T15:20:18',
      userId: 'usr-001',
      userName: 'Carolina Méndez',
      userRole: 'Gerente',
      entityType: 'EXPENSE',
      action: 'CREATE',
      entityId: 'exp-013',
      details: 'Aprobación y registro de egreso operativo: Publicidad digital en redes sociales por valor de $600.000.',
    },
    {
      id: 'aud-009',
      timestamp: '2026-09-09T14:40:55',
      userId: 'usr-002',
      userName: 'Valentina Ríos',
      userRole: 'Administradora',
      entityType: 'PAYMENT',
      action: 'CREATE',
      entityId: 'pay-004',
      details: 'Registro de abono de $600.000 (Transferencia Bancaria) para Laura Martínez Ochoa (Ácido Hialurónico – Labios).',
    },
    {
      id: 'aud-008',
      timestamp: '2026-09-09T14:15:22',
      userId: 'usr-002',
      userName: 'Valentina Ríos',
      userRole: 'Administradora',
      entityType: 'CLIENT',
      action: 'CONVERT',
      entityId: 'cli-005',
      details: 'Cliente Daniela Zuluaga Gómez convertida con éxito en Paciente Clínica (Expediente pat-004).',
    },
    {
      id: 'aud-007',
      timestamp: '2026-09-09T11:30:00',
      userId: 'usr-003',
      userName: 'Dr. Andrés Castaño',
      userRole: 'Médico',
      entityType: 'PATIENT',
      action: 'UPDATE',
      entityId: 'pat-002',
      details: 'Actualización de historia médica y diagnóstico estético Glogau II para Laura Martínez Ochoa.',
    },
    {
      id: 'aud-006',
      timestamp: '2026-09-09T09:05:14',
      userId: 'usr-002',
      userName: 'Valentina Ríos',
      userRole: 'Administradora',
      entityType: 'AUTH',
      action: 'LOGIN',
      entityId: 'usr-002',
      details: 'Inicio de sesión exitoso en el sistema como ADMINISTRADORA (valentina@esteticaclinic.com).',
    },
    {
      id: 'aud-005',
      timestamp: '2026-09-09T08:50:33',
      userId: 'usr-002',
      userName: 'Valentina Ríos',
      userRole: 'Administradora',
      entityType: 'APPOINTMENT',
      action: 'UPDATE',
      entityId: 'apt-001',
      details: 'Cita confirmada telefónicamente para Mariana Soto el 12 de Septiembre de 2026 a las 10:00 a.m.',
    },
    {
      id: 'aud-004',
      timestamp: '2026-09-09T08:45:12',
      userId: 'usr-002',
      userName: 'Valentina Ríos',
      userRole: 'Administradora',
      entityType: 'APPOINTMENT',
      action: 'CONTACT_ATTEMPTED',
      entityId: 'apt-001',
      details: 'Contacto vía WhatsApp iniciado con la paciente Mariana Soto (+57 312 456 7890).',
    },
    {
      id: 'aud-003',
      timestamp: '2026-09-09T08:00:00',
      userId: 'system',
      userName: 'Mariana Soto Valderrama',
      userRole: 'Cliente Web',
      entityType: 'APPOINTMENT',
      action: 'CREATE',
      entityId: 'apt-001',
      details: 'Cita solicitada online para Toxina Botulínica (Botox) el 12 de Septiembre a las 10:00 a.m.',
    },
    {
      id: 'aud-002',
      timestamp: '2026-09-09T07:59:58',
      userId: 'system',
      userName: 'Mariana Soto Valderrama',
      userRole: 'Cliente Web',
      entityType: 'CLIENT',
      action: 'CREATE',
      entityId: 'cli-001',
      details: 'Nuevo cliente potencial registrado en la base de datos desde la landing pública (+57 312 456 7890).',
    },
    {
      id: 'aud-001',
      timestamp: '2026-09-08T08:00:00',
      userId: 'usr-001',
      userName: 'Carolina Méndez',
      userRole: 'Gerente',
      entityType: 'AUTH',
      action: 'LOGIN',
      entityId: 'usr-001',
      details: 'Inicio de sesión exitoso en el sistema como GERENTE (carolina@esteticaclinic.com).',
    },
  ]);

  readonly entries = this._entries.asReadonly();

  readonly totalEntries = computed(() => this._entries().length);

  log(entry: {
    userId?: string;
    userName?: string;
    userRole?: string;
    entityType: AuditEntityType;
    action: AuditAction;
    entityId: string;
    details: string;
  }): void {
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      userId: entry.userId || 'system',
      userName: entry.userName || 'Sistema Web',
      userRole: entry.userRole || 'Público',
      entityType: entry.entityType,
      action: entry.action,
      entityId: entry.entityId,
      details: entry.details,
    };

    this._entries.update(list => [newEntry, ...list]);
  }

  getEntries(): AuditLogEntry[] {
    return this._entries();
  }

  getEntriesByEntity(entityType: AuditEntityType, entityId?: string): AuditLogEntry[] {
    return this._entries().filter(e => {
      if (e.entityType !== entityType) return false;
      if (entityId && e.entityId !== entityId) return false;
      return true;
    });
  }
}
