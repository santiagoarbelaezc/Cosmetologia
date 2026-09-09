import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  adminOnly: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside
      class="fixed left-0 top-0 h-screen flex flex-col bg-white border-r border-zinc-200/80 transition-all duration-300 ease-out z-40"
      [class.w-64]="!isCollapsed()"
      [class.w-20]="isCollapsed()"
    >
      <!-- Logo / Brand -->
      <div class="flex items-center gap-3 px-6 py-6 border-b border-zinc-100">
        <div class="w-9 h-9 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>
        @if (!isCollapsed()) {
          <div class="min-w-0">
            <h1 class="text-sm font-bold tracking-tight text-zinc-900 truncate">Estética Clinic</h1>
            <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Medicina Estética</p>
          </div>
        }
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p class="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-300"
           [class.hidden]="isCollapsed()">
          Menú
        </p>
        @for (item of filteredNavItems(); track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="bg-zinc-100 text-zinc-900"
            [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-all duration-200"
            [title]="item.label"
          >
            <span class="flex-shrink-0 w-5 h-5" [innerHTML]="item.icon"></span>
            @if (!isCollapsed()) {
              <span>{{ item.label }}</span>
            }
          </a>
        }
      </nav>

      <!-- User Info -->
      <div class="border-t border-zinc-100 px-3 py-4">
        @if (authService.currentUser(); as user) {
          <div class="flex items-center gap-3 px-3">
            <div class="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0">
              <span class="text-xs font-bold text-zinc-600">
                {{ user.name.charAt(0) }}
              </span>
            </div>
            @if (!isCollapsed()) {
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-zinc-800 truncate">{{ user.name }}</p>
                <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">{{ user.role }}</p>
              </div>
            }
          </div>
          <button
            (click)="logout()"
            class="flex items-center gap-3 w-full mt-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-rose-500 hover:bg-rose-50/50 transition-all duration-200"
            [title]="'Cerrar sesión'"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            @if (!isCollapsed()) {
              <span>Cerrar sesión</span>
            }
          </button>
        }
      </div>

      <!-- Collapse Toggle -->
      <button
        (click)="toggleCollapse()"
        class="absolute -right-3 top-8 w-6 h-6 bg-white border border-zinc-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 z-50"
      >
        <svg
          class="w-3.5 h-3.5 text-zinc-500 transition-transform duration-300"
          [class.rotate-180]="isCollapsed()"
          fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
    </aside>
  `,
})
export class SidebarComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isCollapsed = signal(false);

  private readonly navItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      adminOnly: false,
      icon: '<svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>',
    },
    {
      label: 'Pacientes',
      route: '/pacientes',
      adminOnly: false,
      icon: '<svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>',
    },
    {
      label: 'Gastos e Insumos',
      route: '/gastos',
      adminOnly: true,
      icon: '<svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>',
    },
  ];

  readonly filteredNavItems = computed(() => {
    if (this.authService.isAdmin()) {
      return this.navItems;
    }
    return this.navItems.filter(item => !item.adminOnly);
  });

  toggleCollapse(): void {
    this.isCollapsed.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
