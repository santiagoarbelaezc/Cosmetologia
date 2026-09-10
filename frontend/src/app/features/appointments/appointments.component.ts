import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/services/auth.service';
import { PermissionsService } from '../../core/services/permissions.service';
import { Appointment, AppointmentStatus } from '../../core/models/appointment.model';
import { PillTabsComponent } from '../../shared/components/pill-tabs/pill-tabs.component';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, PillTabsComponent],
  template: `
    <div class="space-y-6 animate-fade-in max-w-7xl mx-auto">
      
      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- HEADER CON RESUMEN OPERATIVO DE CITAS                    -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="micro-label">Agendamiento & Recepción</span>
          <div class="flex items-center gap-3 mt-1">
            <h1 class="page-title">Agenda de Citas</h1>
            @if (unreadCount() > 0) {
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-900 text-white animate-pulse">
                {{ unreadCount() }} nuevas
              </span>
            }
          </div>
          <p class="text-xs text-zinc-400 mt-1">
            Gestión de citas online (8am–4pm), confirmación directa y contacto por WhatsApp.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            type="button"
            (click)="activeTab.set('Nuevas')"
            class="rounded-full border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-semibold px-3.5 py-2 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span class="w-2 h-2 rounded-full" [ngClass]="pendingCount() > 0 ? 'bg-amber-500 animate-pulse' : 'bg-zinc-300'"></span>
            <span>{{ pendingCount() }} Pendientes</span>
          </button>
        </div>
      </div>

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- 4.1 SUB-TABS (PILL-TABS)                                  -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
        <app-pill-tabs
          [tabs]="tabs"
          [activeTab]="activeTab()"
          (tabChange)="activeTab.set($event)"
        />

        @if (activeTab() === 'Todas las Citas') {
          <div class="flex items-center gap-2">
            <button
              (click)="exportToCsv()"
              class="rounded-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-semibold px-3 py-1.5 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Exportar citas a Excel/CSV"
            >
              <svg class="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span>Exportar Excel</span>
            </button>
            <button
              (click)="printPdf()"
              class="rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold px-3.5 py-1.5 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Imprimir listado en PDF"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24-1.076-.641-2.074-1.18-2.95m12.92 2.95c.24-1.076.64-2.074 1.18-2.95m-14.1 0A12.012 12.012 0 0112 3c2.72 0 5.23 1.05 7.18 2.779m-14.1 0A12.012 12.012 0 003 12c0 1.68.34 3.28.96 4.74m16.08-9.48A12.012 12.012 0 0121 12c0 1.68-.34 3.28-.96 4.74" />
              </svg>
              <span>Imprimir PDF</span>
            </button>
          </div>
        }
      </div>

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- 4.2 TAB "NUEVAS" — BANDEJA DE CITAS RECIÉN AGENDADAS      -->
      <!-- ═════════════════════════════════════════════════════════ -->
      @if (activeTab() === 'Nuevas') {
        <div class="space-y-4 animate-fade-in">
          @if (pendingAppointments().length === 0) {
            <div class="card p-12 text-center bg-white border border-zinc-200/80 rounded-2xl space-y-3">
              <div class="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-sm font-bold text-zinc-900">Bandeja al día</h3>
              <p class="text-xs text-zinc-400 max-w-sm mx-auto">
                No hay citas pendientes de confirmación en este momento. Las nuevas solicitudes agendadas desde la landing aparecerán aquí automáticamente.
              </p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (apt of pendingAppointments(); track apt.id) {
                <div class="card p-5 bg-white border border-zinc-200/80 rounded-2xl space-y-4 hover:border-zinc-300 transition-all flex flex-col justify-between shadow-xs">
                  <div class="space-y-3">
                    <div class="flex items-start justify-between gap-2">
                      <div>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                          Pendiente de Confirmar
                        </span>
                        <h3 class="text-sm sm:text-base font-bold text-zinc-900 mt-1.5 leading-snug">
                          {{ apt.patientName }}
                        </h3>
                        <p class="text-xs text-zinc-500 font-medium mt-0.5">
                          {{ apt.patientPhone }}
                        </p>
                      </div>
                      <span class="text-[11px] font-bold text-zinc-400">
                        {{ apt.id }}
                      </span>
                    </div>

                    <div class="p-3 bg-zinc-50 rounded-xl space-y-1.5 text-xs text-zinc-600 border border-zinc-200/50">
                      <div class="flex items-center justify-between">
                        <span class="text-zinc-400">Servicio:</span>
                        <strong class="text-zinc-900 truncate max-w-[170px]">{{ apt.serviceName }}</strong>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-zinc-400">Especialista:</span>
                        <span class="text-zinc-800 font-semibold">{{ apt.specialistName || 'Por Asignar' }}</span>
                      </div>
                      <div class="flex items-center justify-between pt-1 border-t border-zinc-200/60">
                        <span class="text-zinc-400">Fecha y Hora:</span>
                        <span class="font-bold text-zinc-900">{{ apt.date }} · {{ apt.timeSlot }} hrs</span>
                      </div>
                    </div>

                    @if (apt.notes) {
                      <p class="text-xs text-zinc-500 italic bg-zinc-50/50 p-2.5 rounded-lg border border-zinc-100">
                        "{{ apt.notes }}"
                      </p>
                    }
                  </div>

                  <!-- Botones de Acción de la Tarjeta -->
                  <div class="pt-3 border-t border-zinc-100 flex flex-col gap-2">
                    <div class="flex items-center gap-2">
                      <!-- Confirmar -->
                      <button
                        (click)="confirmAppointment(apt.id)"
                        class="flex-1 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold py-2 px-3 transition-all cursor-pointer shadow-xs text-center"
                      >
                        Confirmar
                      </button>

                      <!-- Hablar por WhatsApp -->
                      <button
                        (click)="openWhatsApp(apt)"
                        class="rounded-full border border-zinc-200 hover:bg-zinc-50 text-zinc-900 text-xs font-semibold py-2 px-3 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        title="Abrir conversación de WhatsApp con mensaje precargado"
                      >
                        <!-- Icono WhatsApp sobrio/monocromático -->
                        <svg class="w-3.5 h-3.5 text-zinc-800" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                        <span>WhatsApp</span>
                      </button>
                    </div>

                    <!-- Cancelar Cita -->
                    <button
                      (click)="cancelAppointment(apt.id)"
                      class="text-[11px] font-semibold text-zinc-400 hover:text-zinc-700 transition-colors py-1 cursor-pointer"
                    >
                      Cancelar cita
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- 4.3 TAB "CALENDARIO" — VISTA GENERAL DE AGENDA            -->
      <!-- ═════════════════════════════════════════════════════════ -->
      @if (activeTab() === 'Calendario') {
        <div class="space-y-4 animate-fade-in">
          
          <!-- Filtro por Especialista -->
          <div class="card p-4 bg-white border border-zinc-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-zinc-700">Filtrar por Especialista:</span>
              <select [(ngModel)]="calendarSpecialistFilter" class="input-premium text-xs py-1.5 px-3">
                <option value="all">Todos los Especialistas</option>
                <option value="usr-003">Dr. Andrés Castaño (Medicina Estética)</option>
                <option value="usr-004">Camila Herrera (Cosmetología & Corporal)</option>
              </select>
            </div>

            <div class="flex items-center gap-4 text-xs font-medium text-zinc-500">
              <span class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Confirmada
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span> Pendiente
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-zinc-300"></span> Cancelada
              </span>
            </div>
          </div>

          <!-- Grid Semanal de Citas -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            @for (date of agendaDates; track date) {
              <div class="card p-4 bg-white border border-zinc-200/80 rounded-2xl space-y-3">
                <div class="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <h4 class="text-xs font-bold text-zinc-900">{{ formatDateLabel(date) }}</h4>
                  <span class="text-[10.5px] font-semibold text-zinc-400">
                    {{ getAppointmentsForDate(date).length }} citas
                  </span>
                </div>

                <div class="space-y-2">
                  @for (apt of getAppointmentsForDate(date); track apt.id) {
                    <div
                      (click)="openDetailModal(apt)"
                      class="p-2.5 rounded-xl border transition-all cursor-pointer text-xs space-y-1"
                      [ngClass]="{
                        'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50': apt.status === 'CONFIRMED',
                        'bg-amber-50/50 border-amber-200 hover:bg-amber-50': apt.status === 'PENDING',
                        'bg-zinc-50 border-zinc-200/70 text-zinc-400 opacity-60': apt.status === 'CANCELLED'
                      }"
                    >
                      <div class="flex items-center justify-between">
                        <strong class="font-bold text-zinc-900 truncate">{{ apt.timeSlot }} hrs</strong>
                        <span class="text-[10px] font-semibold px-1.5 py-0.2 rounded"
                              [ngClass]="apt.status === 'CONFIRMED' ? 'text-emerald-700 bg-emerald-100/60' : apt.status === 'PENDING' ? 'text-amber-800 bg-amber-100/60' : 'text-zinc-500 bg-zinc-200/60'">
                          {{ apt.status === 'CONFIRMED' ? 'Confirmada' : apt.status === 'PENDING' ? 'Pendiente' : 'Cancelada' }}
                        </span>
                      </div>
                      <p class="font-semibold text-zinc-800 truncate">{{ apt.patientName }}</p>
                      <p class="text-[11px] text-zinc-500 truncate">{{ apt.serviceName }}</p>
                      <p class="text-[10px] text-zinc-400 pt-0.5 truncate">{{ apt.specialistName || 'Sin asignar' }}</p>
                    </div>
                  }

                  @if (getAppointmentsForDate(date).length === 0) {
                    <p class="text-center py-6 text-xs text-zinc-400 italic">Sin citas programadas</p>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- 4.4 TAB "TODAS LAS CITAS" — TABLA HISTÓRICA               -->
      <!-- ═════════════════════════════════════════════════════════ -->
      @if (activeTab() === 'Todas las Citas') {
        <div class="card p-5 bg-white border border-zinc-200/80 rounded-2xl space-y-4 animate-fade-in shadow-xs">
          
          <!-- Barra de Búsqueda y Filtros -->
          <div class="flex flex-col sm:flex-row items-center gap-3">
            <div class="relative flex-1 w-full">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Buscar por paciente, teléfono o servicio..."
                class="input-premium text-xs pl-9"
              />
              <svg class="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>

            <select [(ngModel)]="statusFilter" class="input-premium text-xs py-2 px-3 w-full sm:w-44">
              <option value="ALL">Todos los Estados</option>
              <option value="PENDING">Pendientes</option>
              <option value="CONFIRMED">Confirmadas</option>
              <option value="CANCELLED">Canceladas</option>
            </select>
          </div>

          <!-- Tabla de Citas -->
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead class="bg-zinc-50/80 text-[10px] uppercase font-bold tracking-wider text-zinc-400 border-b border-zinc-100">
                <tr>
                  <th class="py-3 px-3">Código</th>
                  <th class="py-3 px-3">Paciente</th>
                  <th class="py-3 px-3">Tratamiento</th>
                  <th class="py-3 px-3">Especialista</th>
                  <th class="py-3 px-3">Fecha & Hora</th>
                  <th class="py-3 px-3">Origen</th>
                  <th class="py-3 px-3">Estado</th>
                  <th class="py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-100 font-medium">
                @for (apt of filteredAppointments(); track apt.id) {
                  <tr class="hover:bg-zinc-50/60 transition-colors">
                    <td class="py-3 px-3 font-mono text-zinc-400 font-bold">{{ apt.id }}</td>
                    <td class="py-3 px-3">
                      <strong class="text-zinc-900 block">{{ apt.patientName }}</strong>
                      <span class="text-zinc-400 text-[11px]">{{ apt.patientPhone }}</span>
                    </td>
                    <td class="py-3 px-3 text-zinc-800">{{ apt.serviceName }}</td>
                    <td class="py-3 px-3 text-zinc-600">{{ apt.specialistName || 'Sin asignar' }}</td>
                    <td class="py-3 px-3">
                      <strong class="text-zinc-900 block">{{ apt.date }}</strong>
                      <span class="text-zinc-400">{{ apt.timeSlot }} hrs</span>
                    </td>
                    <td class="py-3 px-3">
                      <span class="text-[10.5px] px-2 py-0.5 rounded-full"
                            [ngClass]="apt.createdBy === 'CLIENT_SELF' ? 'bg-zinc-100 text-zinc-700' : 'bg-blue-50 text-blue-700'">
                        {{ apt.createdBy === 'CLIENT_SELF' ? 'Web Cliente' : 'Staff Interno' }}
                      </span>
                    </td>
                    <td class="py-3 px-3">
                      <span class="text-[10.5px] font-bold px-2 py-0.5 rounded-full"
                            [ngClass]="{
                              'bg-emerald-50 text-emerald-700 border border-emerald-200': apt.status === 'CONFIRMED',
                              'bg-amber-50 text-amber-800 border border-amber-200': apt.status === 'PENDING',
                              'bg-zinc-100 text-zinc-500': apt.status === 'CANCELLED'
                            }">
                        {{ apt.status === 'CONFIRMED' ? 'Confirmada' : apt.status === 'PENDING' ? 'Pendiente' : 'Cancelada' }}
                      </span>
                    </td>
                    <td class="py-3 px-3 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        <button
                          (click)="openWhatsApp(apt)"
                          class="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                          title="Contactar vía WhatsApp"
                        >
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                          </svg>
                        </button>
                        <button
                          (click)="openDetailModal(apt)"
                          class="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer text-xs font-semibold"
                        >
                          Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- 4.5 TAB "NOTIFICACIONES"                                  -->
      <!-- ═════════════════════════════════════════════════════════ -->
      @if (activeTab() === 'Notificaciones') {
        <div class="card p-5 bg-white border border-zinc-200/80 rounded-2xl space-y-4 animate-fade-in shadow-xs max-w-3xl">
          <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 class="text-sm font-bold text-zinc-900">Avisos de Agendamiento</h3>
              <p class="text-xs text-zinc-400">Notificaciones de citas creadas o canceladas</p>
            </div>
            @if (unreadCount() > 0) {
              <button
                (click)="markAllAsRead()"
                class="text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:underline cursor-pointer"
              >
                Marcar todas como leídas
              </button>
            }
          </div>

          <div class="space-y-2">
            @for (notif of notifications(); track notif.id) {
              <div
                (click)="onNotificationClick(notif)"
                class="p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3"
                [ngClass]="notif.read ? 'bg-zinc-50/50 border-zinc-100 text-zinc-600' : 'bg-white border-zinc-300 shadow-xs text-zinc-900 font-semibold'"
              >
                <div class="flex items-start gap-3">
                  <div class="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
                       [ngClass]="notif.type === 'NEW_APPOINTMENT' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'">
                    {{ notif.type === 'NEW_APPOINTMENT' ? '📅' : '✕' }}
                  </div>
                  <div>
                    <p class="text-xs leading-snug">{{ notif.message }}</p>
                    <p class="text-[10.5px] text-zinc-400 mt-0.5">{{ notif.date }} a las {{ notif.timeSlot }} hrs</p>
                  </div>
                </div>

                @if (!notif.read) {
                  <span class="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-2"></span>
                }
              </div>
            }

            @if (notifications().length === 0) {
              <p class="text-center py-8 text-xs text-zinc-400">No hay notificaciones registradas.</p>
            }
          </div>
        </div>
      }

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- MODAL DETALLE DE CITA                                     -->
      <!-- ═════════════════════════════════════════════════════════ -->
      @if (selectedAppointment()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div class="card w-full max-w-lg p-6 bg-white rounded-3xl shadow-2xl space-y-4 animate-slide-up border border-zinc-200">
            <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Detalle de Cita</span>
                <h3 class="text-base font-bold text-zinc-900">{{ selectedAppointment()?.id }}</h3>
              </div>
              <button
                (click)="selectedAppointment.set(null)"
                class="w-7 h-7 rounded-full bg-zinc-100 text-zinc-500 hover:text-zinc-900 flex items-center justify-center cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <div class="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-2 text-xs">
              <div class="flex justify-between">
                <span class="text-zinc-500">Paciente:</span>
                <strong class="text-zinc-900">{{ selectedAppointment()?.patientName }}</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-500">Teléfono:</span>
                <strong class="text-zinc-900">{{ selectedAppointment()?.patientPhone }}</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-500">Servicio:</span>
                <strong class="text-zinc-900">{{ selectedAppointment()?.serviceName }}</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-500">Especialista:</span>
                <span class="text-zinc-800 font-semibold">{{ selectedAppointment()?.specialistName || 'Sin asignar' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-500">Fecha y Hora:</span>
                <strong class="text-zinc-900">{{ selectedAppointment()?.date }} · {{ selectedAppointment()?.timeSlot }} hrs</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-500">Estado actual:</span>
                <span class="font-bold uppercase text-[10px] px-2 py-0.5 rounded-full"
                      [ngClass]="selectedAppointment()?.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : selectedAppointment()?.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-zinc-200 text-zinc-700'">
                  {{ selectedAppointment()?.status }}
                </span>
              </div>
            </div>

            @if (selectedAppointment()?.notes) {
              <div class="text-xs p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-zinc-600">
                <span class="font-bold text-zinc-700 block mb-0.5">Notas del cliente:</span>
                "{{ selectedAppointment()?.notes }}"
              </div>
            }

            <div class="flex items-center justify-between pt-3 border-t border-zinc-100 gap-2">
              <button
                (click)="openWhatsApp(selectedAppointment()!)"
                class="rounded-full border border-zinc-200 hover:bg-zinc-50 text-zinc-900 text-xs font-semibold py-2 px-3.5 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>WhatsApp</span>
              </button>

              <div class="flex items-center gap-2">
                @if (selectedAppointment()?.status === 'PENDING') {
                  <button
                    (click)="confirmAppointment(selectedAppointment()!.id)"
                    class="rounded-full bg-zinc-950 text-white text-xs font-bold py-2 px-4 hover:bg-zinc-800 cursor-pointer shadow-xs"
                  >
                    Confirmar Cita
                  </button>
                }

                @if (selectedAppointment()?.status !== 'CANCELLED') {
                  <button
                    (click)="cancelAppointment(selectedAppointment()!.id)"
                    class="rounded-full border border-zinc-200 text-zinc-600 text-xs font-semibold py-2 px-3 hover:bg-zinc-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
      }

    </div>
  `,
})
export class AppointmentsComponent {
  private readonly appointmentService = inject(AppointmentService);
  private readonly authService = inject(AuthService);
  readonly permissions = inject(PermissionsService);

  readonly tabs = ['Nuevas', 'Calendario', 'Todas las Citas', 'Notificaciones'];
  readonly activeTab = signal<string>('Nuevas');

  readonly appointments = this.appointmentService.appointments;
  readonly notifications = this.appointmentService.notifications;
  readonly unreadCount = this.appointmentService.unreadNotificationsCount;
  readonly pendingAppointments = this.appointmentService.pendingAppointments;
  readonly pendingCount = computed(() => this.pendingAppointments().length);

  readonly selectedAppointment = signal<Appointment | null>(null);

  // Filters
  searchQuery = '';
  statusFilter = 'ALL';
  calendarSpecialistFilter = 'all';

  // Sample Agenda dates for the calendar view
  readonly agendaDates = [
    '2026-09-10',
    '2026-09-11',
    '2026-09-12',
    '2026-09-14',
    '2026-09-15',
    '2026-09-16',
    '2026-09-17',
    '2026-09-18',
  ];

  readonly filteredAppointments = computed(() => {
    let list = this.appointments();

    if (this.statusFilter !== 'ALL') {
      list = list.filter(a => a.status === this.statusFilter);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(
        a =>
          a.patientName.toLowerCase().includes(q) ||
          a.patientPhone.includes(q) ||
          a.serviceName.toLowerCase().includes(q) ||
          (a.specialistName && a.specialistName.toLowerCase().includes(q))
      );
    }

    return list;
  });

  getAppointmentsForDate(date: string): Appointment[] {
    return this.appointments().filter(a => {
      if (a.date !== date) return false;
      if (this.calendarSpecialistFilter !== 'all' && a.specialistId !== this.calendarSpecialistFilter) {
        return false;
      }
      return true;
    });
  }

  formatDateLabel(date: string): string {
    const parts = date.split('-');
    const day = parts[2];
    const month = parts[1] === '09' ? 'Sept' : parts[1];
    return `${day} ${month}`;
  }

  confirmAppointment(id: string): void {
    this.appointmentService.confirmAppointment(id);
    if (this.selectedAppointment()?.id === id) {
      this.selectedAppointment.set(null);
    }
  }

  cancelAppointment(id: string): void {
    const reason = prompt('Motivo de la cancelación (opcional):') || undefined;
    this.appointmentService.cancelAppointment(id, reason);
    if (this.selectedAppointment()?.id === id) {
      this.selectedAppointment.set(null);
    }
  }

  openWhatsApp(apt: Appointment): void {
    const cleanPhone = apt.patientPhone.replace(/\D/g, '');
    const appointmentInfo = `${apt.serviceName} el día ${apt.date} a las ${apt.timeSlot} hrs`;
    const message = encodeURIComponent(
      `Hola ${apt.patientName}, te contactamos de Estética Clinic respecto a tu cita: ${appointmentInfo}. ¿Podrías confirmarnos tu asistencia?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    this.appointmentService.logWhatsAppContact(apt.id);
  }

  openDetailModal(apt: Appointment): void {
    this.selectedAppointment.set(apt);
  }

  onNotificationClick(notif: any): void {
    this.appointmentService.markNotificationAsRead(notif.id);
    const apt = this.appointments().find(a => a.id === notif.appointmentId);
    if (apt) {
      this.openDetailModal(apt);
    }
  }

  markAllAsRead(): void {
    this.appointmentService.markAllNotificationsAsRead();
  }

  exportToCsv(): void {
    const headers = ['ID', 'Paciente', 'Telefono', 'Email', 'Servicio', 'Especialista', 'Fecha', 'Hora', 'Estado', 'Origen'];
    const rows = this.filteredAppointments().map(a => [
      a.id,
      `"${a.patientName}"`,
      `"${a.patientPhone}"`,
      `"${a.patientEmail || ''}"`,
      `"${a.serviceName}"`,
      `"${a.specialistName || ''}"`,
      a.date,
      a.timeSlot,
      a.status,
      a.createdBy,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Citas_EsteticaClinic_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  printPdf(): void {
    window.print();
  }
}
