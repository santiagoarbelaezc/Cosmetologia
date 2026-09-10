import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClientService } from '../../core/services/client.service';
import { ClientLead, ClientStatus } from '../../core/models/client.model';
import { AppointmentService } from '../../core/services/appointment.service';
import { PermissionsService } from '../../core/services/permissions.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6 animate-fade-in max-w-7xl mx-auto">
      
      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- HEADER DEL MÓDULO                                         -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="micro-label">Gestión de Prospectos & Citas Web</span>
          <div class="flex items-center gap-3 mt-1">
            <h1 class="page-title">Base de Clientes</h1>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-800">
              {{ totalCount() }} registrados
            </span>
          </div>
          <p class="text-xs text-zinc-400 mt-1 max-w-2xl">
            Directorio de pacientes potenciales que han agendado citas desde la landing pública o canales directos. Permite seguimiento por WhatsApp y conversión a expediente clínico.
          </p>
        </div>

        <button
          type="button"
          (click)="openManualClientModal()"
          class="btn-primary text-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Registrar Cliente Manual</span>
        </button>
      </div>

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- METRICAS / KPIS                                           -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div class="card p-4 bg-white border border-zinc-200/80 rounded-2xl shadow-xs">
          <span class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Total Clientes</span>
          <p class="text-2xl font-black text-zinc-950 mt-1">{{ totalCount() }}</p>
          <span class="text-[11px] text-zinc-500 mt-0.5 block">Histórico de contactos</span>
        </div>

        <div class="card p-4 bg-white border border-zinc-200/80 rounded-2xl shadow-xs">
          <span class="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Nuevos por Contactar</span>
          <p class="text-2xl font-black text-amber-600 mt-1">{{ newClientsCount() }}</p>
          <span class="text-[11px] text-zinc-500 mt-0.5 block">Pendientes de primera respuesta</span>
        </div>

        <div class="card p-4 bg-white border border-zinc-200/80 rounded-2xl shadow-xs">
          <span class="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Citas Confirmadas</span>
          <p class="text-2xl font-black text-emerald-600 mt-1">{{ confirmedClientsCount() }}</p>
          <span class="text-[11px] text-zinc-500 mt-0.5 block">Con fecha y hora agendada</span>
        </div>

        <div class="card p-4 bg-white border border-zinc-200/80 rounded-2xl shadow-xs">
          <span class="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Convertidos a Pacientes</span>
          <p class="text-2xl font-black text-indigo-600 mt-1">{{ convertedClientsCount() }}</p>
          <span class="text-[11px] text-zinc-500 mt-0.5 block">Con expediente clínico activo</span>
        </div>
      </div>

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- FILTROS Y BÚSQUEDA                                        -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <div class="card p-4 bg-white border border-zinc-200/80 rounded-2xl flex flex-col sm:flex-row items-center gap-3 shadow-xs">
        <div class="relative flex-1 w-full">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Buscar por nombre, celular, email o servicio solicitado..."
            class="input-premium text-xs pl-9"
          />
          <svg class="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>

        <select [(ngModel)]="statusFilter" class="input-premium text-xs py-2 px-3 w-full sm:w-56">
          <option value="ALL">Todos los Estados ({{ totalCount() }})</option>
          <option value="NEW">Nuevos ({{ newClientsCount() }})</option>
          <option value="CONTACTED">Contactados ({{ contactedClientsCount() }})</option>
          <option value="CONFIRMED">Cita Confirmada ({{ confirmedClientsCount() }})</option>
          <option value="CONVERTED">Convertidos a Pacientes ({{ convertedClientsCount() }})</option>
        </select>
      </div>

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- TABLA DE CLIENTES                                         -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <div class="card bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-zinc-50/90 text-[10.5px] uppercase font-bold tracking-wider text-zinc-400 border-b border-zinc-100">
              <tr>
                <th class="py-3.5 px-4 whitespace-nowrap">Cliente / Contacto</th>
                <th class="py-3.5 px-4 whitespace-nowrap">Canal</th>
                <th class="py-3.5 px-4 whitespace-nowrap">Tratamiento de Interés</th>
                <th class="py-3.5 px-4 whitespace-nowrap">Especialista</th>
                <th class="py-3.5 px-4 whitespace-nowrap">Citas</th>
                <th class="py-3.5 px-4 whitespace-nowrap">Estado</th>
                <th class="py-3.5 px-4 text-right whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100 font-medium">
              @for (client of filteredClients(); track client.id) {
                <tr class="hover:bg-zinc-50/60 transition-colors">
                  
                  <!-- Cliente / Contacto -->
                  <td class="py-4 px-4 align-middle">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                        {{ client.name.charAt(0) }}
                      </div>
                      <div class="min-w-0">
                        <strong class="text-zinc-950 font-bold block text-sm leading-tight truncate">{{ client.name }}</strong>
                        <div class="flex items-center gap-2 text-[11px] text-zinc-500 mt-1 whitespace-nowrap">
                          <span>{{ client.phone }}</span>
                          @if (client.email) {
                            <span class="text-zinc-300">·</span>
                            <span class="truncate max-w-[140px]">{{ client.email }}</span>
                          }
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Canal / Origen -->
                  <td class="py-4 px-4 align-middle whitespace-nowrap">
                    <div class="flex flex-col justify-center">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit"
                            [ngClass]="{
                              'bg-emerald-50 text-emerald-800 border border-emerald-200': client.channel === 'LANDING_WEB',
                              'bg-green-50 text-green-800 border border-green-200': client.channel === 'WHATSAPP',
                              'bg-zinc-100 text-zinc-700': client.channel === 'DIRECTO'
                            }">
                        {{ client.channel }}
                      </span>
                      <span class="text-[11px] text-zinc-400 mt-1 block">
                        {{ client.firstContactDate }}
                      </span>
                    </div>
                  </td>

                  <!-- Tratamiento -->
                  <td class="py-4 px-4 align-middle">
                    <div class="max-w-[230px]">
                      <p class="text-zinc-950 font-semibold text-xs leading-snug truncate">{{ client.requestedServiceName }}</p>
                      @if (client.notes) {
                        <p class="text-[11px] text-zinc-400 truncate mt-0.5 leading-tight" [title]="client.notes">
                          "{{ client.notes }}"
                        </p>
                      }
                    </div>
                  </td>

                  <!-- Especialista -->
                  <td class="py-4 px-4 align-middle whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 text-[10px] font-bold flex-shrink-0">
                        {{ (client.preferredSpecialistName || 'S').charAt(0) }}
                      </div>
                      <span class="text-xs text-zinc-900 font-semibold whitespace-nowrap">
                        {{ client.preferredSpecialistName || 'Sin preferencia' }}
                      </span>
                    </div>
                  </td>

                  <!-- Citas -->
                  <td class="py-4 px-4 align-middle whitespace-nowrap">
                    <div class="flex flex-col justify-center">
                      <span class="text-xs font-extrabold text-zinc-950">{{ client.appointmentCount }} cita{{ client.appointmentCount > 1 ? 's' : '' }}</span>
                      <span class="text-[11px] text-zinc-400 mt-0.5">{{ client.lastAppointmentDate ? 'Última: ' + client.lastAppointmentDate : 'Sin fecha' }}</span>
                    </div>
                  </td>

                  <!-- Estado (Badge con punto y sin cortes de línea) -->
                  <td class="py-4 px-4 align-middle whitespace-nowrap">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap tracking-wide"
                          [ngClass]="{
                            'bg-amber-50 text-amber-800 border border-amber-200/80': client.status === 'NEW',
                            'bg-blue-50 text-blue-800 border border-blue-200/80': client.status === 'CONTACTED',
                            'bg-emerald-50 text-emerald-800 border border-emerald-200/80': client.status === 'CONFIRMED',
                            'bg-indigo-50 text-indigo-800 border border-indigo-200/80': client.status === 'CONVERTED'
                          }">
                      <span class="w-1.5 h-1.5 rounded-full"
                            [ngClass]="{
                              'bg-amber-500': client.status === 'NEW',
                              'bg-blue-500': client.status === 'CONTACTED',
                              'bg-emerald-500': client.status === 'CONFIRMED',
                              'bg-indigo-500': client.status === 'CONVERTED'
                            }"></span>
                      <span>{{ getStatusLabel(client.status) }}</span>
                    </span>
                  </td>

                  <!-- Acciones con altura uniforme y alineación perfecta -->
                  <td class="py-4 px-4 align-middle text-right whitespace-nowrap">
                    <div class="inline-flex items-center justify-end gap-2">
                      
                      <!-- Botón WhatsApp -->
                      <a
                        [href]="getWhatsAppLink(client)"
                        target="_blank"
                        class="h-8 w-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors flex items-center justify-center cursor-pointer border border-emerald-200/60 shadow-2xs"
                        title="Contactar vía WhatsApp"
                      >
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.54 1.848.814 2.796.814 3.179 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.768-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.311.045-.698.072-2.316-.59-1.928-.79-3.155-2.756-3.25-2.887-.095-.131-.77-1.025-.77-1.955 0-.93.487-1.387.66-1.577.173-.19.378-.238.504-.238.126 0 .252.002.363.007.116.006.273-.044.426.326.159.385.544 1.33.593 1.429.049.099.082.215.016.347-.066.132-.099.215-.198.33-.099.115-.208.257-.297.345-.099.099-.202.207-.087.405.115.198.513.847 1.101 1.371.758.675 1.397.884 1.595.983.198.099.314.083.43-.05.116-.132.496-.578.628-.776.132-.198.264-.165.446-.099.182.066 1.157.545 1.355.644.198.099.33.149.38.232.049.082.049.479-.095.884z"/>
                        </svg>
                      </a>

                      <!-- Botón Convertir / Ver Expediente -->
                      @if (client.status !== 'CONVERTED') {
                        <button
                          type="button"
                          (click)="openConvertModal(client)"
                          class="h-8 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-[11px] transition-all cursor-pointer shadow-xs inline-flex items-center justify-center whitespace-nowrap"
                          title="Crear expediente clínico para este cliente"
                        >
                          Convertir a Paciente
                        </button>
                      } @else {
                        <a
                          [routerLink]="['/pacientes', client.patientId]"
                          class="h-8 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-all border border-indigo-200/80 cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
                        >
                          <span>Ver Expediente</span>
                          <span class="ml-1">→</span>
                        </a>
                      }

                      <!-- Selector de estado con chevron integrado -->
                      <div class="relative">
                        <select
                          [ngModel]="client.status"
                          (ngModelChange)="onStatusChange(client.id, $event)"
                          class="h-8 pl-2.5 pr-7 text-[11.5px] font-medium rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-white text-zinc-800 cursor-pointer focus:outline-none transition-colors appearance-none whitespace-nowrap"
                        >
                          <option value="NEW">Nuevo</option>
                          <option value="CONTACTED">Contactado</option>
                          <option value="CONFIRMED">Confirmado</option>
                          <option value="CONVERTED">Convertido</option>
                        </select>
                        <svg class="w-3.5 h-3.5 text-zinc-400 absolute right-2 top-2.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>

                    </div>
                  </td>
                </tr>
              }

              @if (filteredClients().length === 0) {
                <tr>
                  <td colspan="7" class="py-10 text-center text-zinc-400 italic">
                    No se encontraron clientes con los filtros seleccionados.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- MODAL: CONVERTIR CLIENTE A PACIENTE CLÍNICO               -->
      <!-- ═════════════════════════════════════════════════════════ -->
      @if (selectedClientToConvert(); as client) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div class="card w-full max-w-lg p-6 sm:p-7 bg-white rounded-3xl shadow-2xl space-y-5 animate-slide-up border border-zinc-200">
            <div class="flex items-start justify-between border-b border-zinc-100 pb-3">
              <div>
                <span class="micro-label">Apertura de Expediente</span>
                <h3 class="text-lg font-bold text-zinc-950 mt-0.5">Convertir Cliente a Paciente</h3>
              </div>
              <button
                type="button"
                (click)="selectedClientToConvert.set(null)"
                class="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <p class="text-xs text-zinc-500 leading-relaxed">
              Al convertir a <strong>{{ client.name }}</strong>, se creará su expediente clínico oficial en el módulo de Pacientes, permitiendo registrar evoluciones médicas, consentimientos y tratamientos.
            </p>

            <div class="space-y-3.5 text-xs">
              <div>
                <label class="label text-xs font-bold text-zinc-900 block mb-1">Nombre Completo</label>
                <input type="text" [value]="client.name" disabled class="input-premium bg-zinc-100/70 text-zinc-600 text-xs" />
              </div>

              <div>
                <label class="label text-xs font-bold text-zinc-900 block mb-1">Documento de Identidad (Cédula) *</label>
                <input
                  type="text"
                  [(ngModel)]="conversionForm.documentId"
                  placeholder="Ej: 1.034.890.123"
                  class="input-premium text-xs"
                  required
                />
              </div>

              <div>
                <label class="label text-xs font-bold text-zinc-900 block mb-1">Especialista Asignado</label>
                <select [(ngModel)]="conversionForm.specialistId" class="input-premium text-xs">
                  <option value="usr-003">Dr. Andrés Castaño (Medicina Estética)</option>
                  <option value="usr-004">Camila Herrera (Cosmetología & Corporal)</option>
                </select>
              </div>

              <div class="p-3 bg-zinc-50 rounded-xl border border-zinc-200/70 text-[11px] text-zinc-500 space-y-1">
                <p><strong>Celular:</strong> {{ client.phone }}</p>
                <p><strong>Servicio inicial:</strong> {{ client.requestedServiceName }}</p>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
              <button
                type="button"
                (click)="selectedClientToConvert.set(null)"
                class="px-4 py-2 rounded-full border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="confirmConversion()"
                [disabled]="!conversionForm.documentId.trim()"
                class="btn-primary text-xs px-5 py-2.5 cursor-pointer disabled:opacity-40"
              >
                Confirmar y Crear Expediente →
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- MODAL: REGISTRO MANUAL DE CLIENTE                         -->
      <!-- ═════════════════════════════════════════════════════════ -->
      @if (showManualClientModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div class="card w-full max-w-lg p-6 sm:p-7 bg-white rounded-3xl shadow-2xl space-y-5 animate-slide-up border border-zinc-200">
            <div class="flex items-start justify-between border-b border-zinc-100 pb-3">
              <div>
                <span class="micro-label">Nuevo Registro</span>
                <h3 class="text-lg font-bold text-zinc-950 mt-0.5">Registrar Cliente Manual</h3>
              </div>
              <button
                type="button"
                (click)="showManualClientModal.set(false)"
                class="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <form (ngSubmit)="saveManualClient()" class="space-y-3.5 text-xs">
              <div>
                <label class="label text-xs font-bold text-zinc-900 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  [(ngModel)]="manualClientForm.name"
                  name="name"
                  placeholder="Ej: Sofía Cardona Mesa"
                  class="input-premium text-xs"
                  required
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="label text-xs font-bold text-zinc-900 block mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    [(ngModel)]="manualClientForm.phone"
                    name="phone"
                    placeholder="Ej: +57 310 999 8888"
                    class="input-premium text-xs"
                    required
                  />
                </div>
                <div>
                  <label class="label text-xs font-bold text-zinc-900 block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    [(ngModel)]="manualClientForm.email"
                    name="email"
                    placeholder="Ej: sofia@email.com"
                    class="input-premium text-xs"
                  />
                </div>
              </div>

              <div>
                <label class="label text-xs font-bold text-zinc-900 block mb-1">Tratamiento de Interés *</label>
                <select [(ngModel)]="manualClientForm.serviceId" name="serviceId" class="input-premium text-xs">
                  <option value="srv-001">Toxina Botulínica (Botox) - Dr. Andrés Castaño</option>
                  <option value="srv-002">Ácido Hialurónico Labios & Surcos - Dr. Andrés Castaño</option>
                  <option value="srv-003">Bioestimulador Radiesse - Dr. Andrés Castaño</option>
                  <option value="srv-005">Drenaje Linfático Post-Quirúrgico - Camila Herrera</option>
                  <option value="srv-006">Limpieza Facial Profunda - Camila Herrera</option>
                </select>
              </div>

              <div>
                <label class="label text-xs font-bold text-zinc-900 block mb-1">Canal de Contacto</label>
                <select [(ngModel)]="manualClientForm.channel" name="channel" class="input-premium text-xs">
                  <option value="DIRECTO">Recepción / Directo</option>
                  <option value="WHATSAPP">WhatsApp Business</option>
                  <option value="LANDING_WEB">Landing Web</option>
                </select>
              </div>

              <div>
                <label class="label text-xs font-bold text-zinc-900 block mb-1">Notas o Inquietudes</label>
                <textarea
                  [(ngModel)]="manualClientForm.notes"
                  name="notes"
                  rows="2"
                  placeholder="Detalles sobre zonas a tratar, presupuesto o preferencias..."
                  class="input-premium text-xs"
                ></textarea>
              </div>

              <div class="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  (click)="showManualClientModal.set(false)"
                  class="px-4 py-2 rounded-full border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="!manualClientForm.name.trim() || !manualClientForm.phone.trim()"
                  class="btn-primary text-xs px-6 py-2.5 cursor-pointer disabled:opacity-40"
                >
                  Guardar en Base de Clientes
                </button>
              </div>
            </form>
          </div>
        </div>
      }

    </div>
  `,
})
export class ClientsComponent {
  private readonly clientService = inject(ClientService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly router = inject(Router);

  readonly clients = this.clientService.clients;
  readonly totalCount = this.clientService.totalClients;
  readonly newClientsCount = this.clientService.newClientsCount;
  readonly contactedClientsCount = this.clientService.contactedClientsCount;
  readonly confirmedClientsCount = this.clientService.confirmedClientsCount;
  readonly convertedClientsCount = this.clientService.convertedClientsCount;

  searchQuery = '';
  statusFilter = 'ALL';

  readonly selectedClientToConvert = signal<ClientLead | null>(null);
  readonly showManualClientModal = signal<boolean>(false);

  conversionForm = {
    documentId: '',
    specialistId: 'usr-003',
  };

  manualClientForm = {
    name: '',
    phone: '',
    email: '',
    serviceId: 'srv-001',
    channel: 'DIRECTO' as const,
    notes: '',
  };

  readonly filteredClients = computed(() => {
    let list = this.clients();

    if (this.statusFilter !== 'ALL') {
      list = list.filter(c => c.status === this.statusFilter);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          c.requestedServiceName.toLowerCase().includes(q) ||
          (c.notes && c.notes.toLowerCase().includes(q))
      );
    }

    return list;
  });

  getStatusLabel(status: ClientStatus): string {
    switch (status) {
      case 'NEW': return 'Nuevo';
      case 'CONTACTED': return 'Contactado';
      case 'CONFIRMED': return 'Cita Confirmada';
      case 'CONVERTED': return 'Paciente Clínico';
      case 'ARCHIVED': return 'Archivado';
      default: return status;
    }
  }

  getWhatsAppLink(client: ClientLead): string {
    const cleanPhone = client.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hola ${client.name}, te saludamos de Estética Clinic. Vemos tu solicitud para el tratamiento de ${client.requestedServiceName}. ¿En qué horario te queda mejor recibir asesoría?`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  }

  onStatusChange(clientId: string, newStatus: ClientStatus): void {
    this.clientService.updateClientStatus(clientId, newStatus);
  }

  openConvertModal(client: ClientLead): void {
    this.selectedClientToConvert.set(client);
    this.conversionForm.documentId = `1.0${Math.floor(10000000 + Math.random() * 90000000)}`;
    this.conversionForm.specialistId = client.preferredSpecialistId || 'usr-003';
  }

  confirmConversion(): void {
    const client = this.selectedClientToConvert();
    if (!client) return;

    const patient = this.clientService.convertToPatient(
      client.id,
      this.conversionForm.documentId,
      this.conversionForm.specialistId
    );

    this.selectedClientToConvert.set(null);

    if (patient) {
      this.router.navigate(['/pacientes', patient.id]);
    }
  }

  openManualClientModal(): void {
    this.manualClientForm = {
      name: '',
      phone: '',
      email: '',
      serviceId: 'srv-001',
      channel: 'DIRECTO',
      notes: '',
    };
    this.showManualClientModal.set(true);
  }

  saveManualClient(): void {
    const srv = this.appointmentService.getServiceById(this.manualClientForm.serviceId);
    this.clientService.registerFromBooking({
      patientName: this.manualClientForm.name,
      patientPhone: this.manualClientForm.phone,
      patientEmail: this.manualClientForm.email,
      serviceId: this.manualClientForm.serviceId,
      serviceName: srv ? srv.name : 'Servicio Especializado',
      specialistId: srv?.recommendedSpecialistId || 'usr-003',
      specialistName: srv?.recommendedSpecialistId === 'usr-004' ? 'Camila Herrera' : 'Dr. Andrés Castaño',
      date: new Date().toISOString().split('T')[0],
      notes: this.manualClientForm.notes,
      channel: this.manualClientForm.channel,
    });

    this.showManualClientModal.set(false);
  }
}
