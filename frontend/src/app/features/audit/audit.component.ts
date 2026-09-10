import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../../core/services/audit.service';
import { AuditLogEntry, AuditEntityType, AuditAction } from '../../core/models/appointment.model';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in max-w-7xl mx-auto">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="micro-label">Cumplimiento & Seguridad</span>
          <div class="flex items-center gap-3 mt-1">
            <h1 class="page-title">Registro de Auditoría</h1>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-800">
              {{ totalCount() }} eventos
            </span>
          </div>
          <p class="text-xs text-zinc-400 mt-1">
            Trazabilidad completa de acciones de usuarios: inicios de sesión, evoluciones clínicas, prescripciones, pagos, citas y prospección de clientes.
          </p>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card p-4 bg-white border border-zinc-200/80 rounded-2xl flex flex-col sm:flex-row items-center gap-3 shadow-xs">
        <div class="relative flex-1 w-full">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Buscar por usuario (Dr. Andrés, Valentina, Carolina...), detalles o ID..."
            class="input-premium text-xs pl-9"
          />
          <svg class="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>

        <select [(ngModel)]="entityFilter" class="input-premium text-xs py-2 px-3 w-full sm:w-48">
          <option value="ALL">Todas las Entidades</option>
          <option value="AUTH">Sesiones (AUTH)</option>
          <option value="CLIENT">Clientes Web (CLIENT)</option>
          <option value="APPOINTMENT">Citas (APPOINTMENT)</option>
          <option value="TREATMENT">Tratamientos (TREATMENT)</option>
          <option value="PATIENT">Pacientes (PATIENT)</option>
          <option value="PAYMENT">Pagos / Abonos (PAYMENT)</option>
          <option value="EXPENSE">Gastos (EXPENSE)</option>
        </select>

        <select [(ngModel)]="actionFilter" class="input-premium text-xs py-2 px-3 w-full sm:w-48">
          <option value="ALL">Todas las Acciones</option>
          <option value="LOGIN">LOGIN (Inicio de sesión)</option>
          <option value="LOGOUT">LOGOUT (Cierre de sesión)</option>
          <option value="CREATE">CREATE (Creación / Registro)</option>
          <option value="UPDATE">UPDATE (Actualización)</option>
          <option value="CONVERT">CONVERT (Conversión)</option>
          <option value="VOID">VOID (Cancelación)</option>
          <option value="CONTACT_ATTEMPTED">CONTACT_ATTEMPTED (WhatsApp)</option>
        </select>
      </div>

      <!-- Tabla de Logs -->
      <div class="card bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-zinc-50/80 text-[10px] uppercase font-bold tracking-wider text-zinc-400 border-b border-zinc-100">
              <tr>
                <th class="py-3 px-4">Fecha / Hora</th>
                <th class="py-3 px-4">Usuario Responsable</th>
                <th class="py-3 px-4">Rol del Usuario</th>
                <th class="py-3 px-4">Entidad</th>
                <th class="py-3 px-4">Acción</th>
                <th class="py-3 px-4">ID Entidad</th>
                <th class="py-3 px-4">Detalles de la Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100 font-medium">
              @for (entry of filteredEntries(); track entry.id) {
                <tr class="hover:bg-zinc-50/60 transition-colors">
                  <td class="py-3 px-4 text-zinc-500 whitespace-nowrap">
                    {{ entry.timestamp | date:'d MMM yyyy, HH:mm:ss' }}
                  </td>
                  <td class="py-3 px-4">
                    <strong class="text-zinc-900 block">{{ entry.userName }}</strong>
                  </td>
                  <td class="py-3 px-4">
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                          [ngClass]="{
                            'bg-zinc-950 text-white': entry.userRole.toLowerCase().includes('gerente'),
                            'bg-indigo-50 text-indigo-700 border border-indigo-200': entry.userRole.toLowerCase().includes('admin'),
                            'bg-emerald-50 text-emerald-700 border border-emerald-200': entry.userRole.toLowerCase().includes('médico') || entry.userRole.toLowerCase().includes('medico'),
                            'bg-purple-50 text-purple-700 border border-purple-200': entry.userRole.toLowerCase().includes('cosmet'),
                            'bg-zinc-100 text-zinc-600': entry.userRole.toLowerCase().includes('cliente') || entry.userRole.toLowerCase().includes('staff')
                          }">
                      {{ entry.userRole }}
                    </span>
                  </td>
                  <td class="py-3 px-4 font-mono font-bold text-zinc-700">
                    {{ entry.entityType }}
                  </td>
                  <td class="py-3 px-4">
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                          [ngClass]="{
                            'bg-emerald-50 text-emerald-800 border border-emerald-200': entry.action === 'CREATE',
                            'bg-blue-50 text-blue-800 border border-blue-200': entry.action === 'UPDATE',
                            'bg-rose-50 text-rose-800 border border-rose-200': entry.action === 'VOID' || entry.action === 'DELETE',
                            'bg-purple-50 text-purple-800 border border-purple-200': entry.action === 'CONTACT_ATTEMPTED',
                            'bg-teal-50 text-teal-800 border border-teal-200': entry.action === 'CONVERT',
                            'bg-sky-50 text-sky-800 border border-sky-200': entry.action === 'LOGIN',
                            'bg-amber-50 text-amber-800 border border-amber-200': entry.action === 'LOGOUT'
                          }">
                      {{ entry.action }}
                    </span>
                  </td>
                  <td class="py-3 px-4 font-mono text-zinc-400 font-bold">
                    {{ entry.entityId }}
                  </td>
                  <td class="py-3 px-4 text-zinc-600 max-w-md leading-relaxed">
                    {{ entry.details }}
                  </td>
                </tr>
              }

              @if (filteredEntries().length === 0) {
                <tr>
                  <td colspan="7" class="py-8 text-center text-zinc-400 italic">
                    No se encontraron registros de auditoría con los filtros actuales.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `,
})
export class AuditComponent {
  private readonly auditService = inject(AuditService);

  readonly entries = this.auditService.entries;
  readonly totalCount = this.auditService.totalEntries;

  searchQuery = '';
  entityFilter = 'ALL';
  actionFilter = 'ALL';

  readonly filteredEntries = computed(() => {
    let list = this.entries();

    if (this.entityFilter !== 'ALL') {
      list = list.filter(e => e.entityType === this.entityFilter);
    }

    if (this.actionFilter !== 'ALL') {
      list = list.filter(e => e.action === this.actionFilter);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(
        e =>
          e.userName.toLowerCase().includes(q) ||
          e.details.toLowerCase().includes(q) ||
          e.entityId.toLowerCase().includes(q)
      );
    }

    return list;
  });
}
