import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { AuthService } from './core/services/auth.service';
import { SidebarService } from './core/services/sidebar.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    @if (authService.isAuthenticated()) {
      <!-- Authenticated Layout: Sidebar + Mobile Topbar + Dynamic Adaptive Main Content -->
      <div class="flex flex-col md:flex-row min-h-screen bg-white">
        
        <!-- Mobile Topbar (< md) -->
        <header class="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200/90 px-4 h-16 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="sidebarService.toggleMobile()"
              class="w-10 h-10 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 flex items-center justify-center cursor-pointer transition-colors active:scale-95"
              title="Abrir menú"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            <div>
              <span class="font-extrabold text-sm tracking-tight text-zinc-950 block leading-tight uppercase">
                Mantra Group
              </span>
              <span class="text-[9px] uppercase tracking-wider text-amber-600 font-bold block">
                Centro Estético
              </span>
            </div>
          </div>

          <!-- User Chip Mobile -->
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
              {{ authService.currentUser()?.name?.charAt(0) }}
            </div>
          </div>
        </header>

        <app-sidebar />

        <!-- Main Content with responsive margin -->
        <main
          class="flex-1 transition-all duration-300 ease-out min-w-0 ml-0"
          [class.md:ml-72]="!sidebarService.isCollapsed()"
          [class.md:ml-20]="sidebarService.isCollapsed()"
        >
          <div
            class="w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-7 transition-all duration-300 ease-out"
            [class.max-w-[1720px]]="!sidebarService.isCollapsed()"
            [class.max-w-none]="sidebarService.isCollapsed()"
          >
            <router-outlet />
          </div>
        </main>
      </div>
    } @else {
      <!-- Unauthenticated: Full-width (Login) -->
      <router-outlet />
    }
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `],
})
export class AppComponent {
  readonly authService = inject(AuthService);
  readonly sidebarService = inject(SidebarService);
}
