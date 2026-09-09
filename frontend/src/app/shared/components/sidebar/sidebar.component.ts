import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PermissionsService } from '../../../core/services/permissions.service';
import { ROLE_LABELS } from '../../../core/models/user.model';

interface NavItem {
  label: string;
  sublabel: string;
  route: string;
  exact: boolean;
  visible: () => boolean;
  iconSvg: string;
}

import { SidebarService } from '../../../core/services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside
      class="fixed left-0 top-0 h-screen flex flex-col bg-white border-r border-zinc-200/90 transition-all duration-300 ease-out z-40 select-none shadow-[1px_0_10px_rgba(0,0,0,0.02)]"
      [class.w-72]="!sidebarService.isCollapsed()"
      [class.w-20]="sidebarService.isCollapsed()"
    >
      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- BRAND & CLINIC IDENTITY                                   -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <div class="px-5 py-5 border-b border-zinc-100 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3.5 min-w-0">
          <!-- Logo Emblem -->
          <div class="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs border border-zinc-800">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>

          @if (!isCollapsed()) {
            <div class="min-w-0">
              <div class="flex items-center gap-1.5">
                <h1 class="text-sm font-extrabold tracking-tight text-zinc-900 truncate">Estética Clinic</h1>
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>
              <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 truncate">
                Medicina & Cosmecéutica
              </p>
            </div>
          }
        </div>
      </div>

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- NAVIGATION MENU WITH SECTION HEADERS                      -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <nav class="flex-1 px-3.5 py-5 space-y-6 overflow-y-auto">
        
        <!-- SECTION 1: GESTIÓN PRINCIPAL -->
        <div class="space-y-1">
          @if (!isCollapsed()) {
            <p class="px-3 mb-2 text-[10.5px] font-bold uppercase tracking-widest text-zinc-400">
              Módulos Principales
            </p>
          }

          @for (item of mainNavItems(); track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active-nav-link"
              [routerLinkActiveOptions]="{ exact: item.exact }"
              class="nav-link-base group"
              [title]="item.label"
            >
              <span class="w-5 h-5 flex-shrink-0 transition-colors" [innerHTML]="item.iconSvg"></span>
              
              @if (!isCollapsed()) {
                <div class="min-w-0 flex-1 text-left">
                  <p class="text-sm font-semibold truncate leading-tight">{{ item.label }}</p>
                  <p class="text-[11px] text-zinc-400 group-hover:text-zinc-500 nav-sublabel truncate">{{ item.sublabel }}</p>
                </div>
                <span class="active-dot hidden w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              }
            </a>
          }
        </div>

        <!-- SECTION 2: ADMINISTRACIÓN & CAJA (Gerente & Admin) -->
        @if (permissions.canViewExpenses()) {
          <div class="space-y-1 pt-3 border-t border-zinc-100">
            @if (!isCollapsed()) {
              <p class="px-3 mb-2 text-[10.5px] font-bold uppercase tracking-widest text-zinc-400">
                Finanzas & Control
              </p>
            }

            @for (item of financeNavItems(); track item.route) {
              <a
                [routerLink]="item.route"
                routerLinkActive="active-nav-link"
                [routerLinkActiveOptions]="{ exact: item.exact }"
                class="nav-link-base group"
                [title]="item.label"
              >
                <span class="w-5 h-5 flex-shrink-0 transition-colors" [innerHTML]="item.iconSvg"></span>
                
                @if (!isCollapsed()) {
                  <div class="min-w-0 flex-1 text-left">
                    <p class="text-sm font-semibold truncate leading-tight">{{ item.label }}</p>
                    <p class="text-[11px] text-zinc-400 group-hover:text-zinc-500 nav-sublabel truncate">{{ item.sublabel }}</p>
                  </div>
                  <span class="active-dot hidden w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                }
              </a>
            }
          </div>
        }
      </nav>

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- USER PROFILE FOOTER CARD                                  -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <div class="p-3 border-t border-zinc-100 bg-white">
        @if (authService.currentUser(); as user) {
          
          <div class="p-3 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 space-y-3">
            <!-- User Info Row -->
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                {{ user.name.charAt(0) }}
              </div>

              @if (!isCollapsed()) {
                <div class="min-w-0 flex-1">
                  <p class="text-xs sm:text-sm font-bold text-zinc-900 truncate leading-tight">
                    {{ user.name }}
                  </p>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span class="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-500 truncate">
                      {{ getRoleLabel(user.role) }}
                    </span>
                  </div>
                </div>
              }
            </div>

            <!-- Logout Button -->
            <button
              (click)="logout()"
              class="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 cursor-pointer"
              [title]="'Cerrar sesión'"
            >
              <svg class="w-4 h-4 flex-shrink-0 text-zinc-400 group-hover:text-rose-600" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              @if (!isCollapsed()) {
                <span>Cerrar sesión</span>
              }
            </button>
          </div>

        }
      </div>

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- COLLAPSE TOGGLE                                           -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <button
        (click)="toggleCollapse()"
        class="absolute -right-3 top-7 w-6 h-6 bg-white border border-zinc-200/90 rounded-full flex items-center justify-center shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 z-50 cursor-pointer"
        title="Contraer / Expandir menú"
      >
        <svg
          class="w-3.5 h-3.5 text-zinc-600 transition-transform duration-300"
          [class.rotate-180]="isCollapsed()"
          fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
    </aside>
  `,
  styles: [`
    .nav-link-base {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.85rem;
      border-radius: 0.875rem;
      color: #52525b; /* zinc-600 */
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .nav-link-base:hover {
      background-color: #f4f4f5; /* zinc-100 */
      color: #18181b; /* zinc-900 */
    }
    .active-nav-link {
      background-color: #18181b !important; /* zinc-900 */
      color: #ffffff !important;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
    }
    .active-nav-link .nav-sublabel {
      color: #a1a1aa !important; /* zinc-400 */
    }
    .active-nav-link .active-dot {
      display: block !important;
    }
  `]
})
export class SidebarComponent {
  readonly authService = inject(AuthService);
  readonly permissions = inject(PermissionsService);
  readonly sidebarService = inject(SidebarService);
  private readonly router = inject(Router);

  readonly isCollapsed = this.sidebarService.isCollapsed;

  private readonly allNavItems: NavItem[] = [
    {
      label: 'Inicio',
      sublabel: 'Resumen & Métricas',
      route: '/dashboard',
      exact: true,
      visible: () => true,
      iconSvg: '<svg fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>',
    },
    {
      label: 'Pacientes & Flujo',
      sublabel: 'Expedientes & Workflow',
      route: '/pacientes',
      exact: false,
      visible: () => true,
      iconSvg: '<svg fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>',
    },
    {
      label: 'Caja & Gastos',
      sublabel: 'Egresos & Balance',
      route: '/gastos',
      exact: true,
      visible: () => this.permissions.canViewExpenses(),
      iconSvg: '<svg fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>',
    },
  ];

  readonly mainNavItems = computed(() =>
    this.allNavItems.filter(item => (item.route === '/dashboard' || item.route === '/pacientes') && item.visible())
  );

  readonly financeNavItems = computed(() =>
    this.allNavItems.filter(item => item.route === '/gastos' && item.visible())
  );

  toggleCollapse(): void {
    this.sidebarService.toggle();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getRoleLabel(role: string): string {
    return ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role;
  }
}
