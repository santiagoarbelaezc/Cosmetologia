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
      <!-- Authenticated Layout: Sidebar + Dynamic Adaptive Main Content -->
      <div class="flex min-h-screen bg-white">
        <app-sidebar />
        <main
          class="flex-1 transition-all duration-300 ease-out min-w-0"
          [class.ml-72]="!sidebarService.isCollapsed()"
          [class.ml-20]="sidebarService.isCollapsed()"
        >
          <div
            class="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-7 transition-all duration-300 ease-out"
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
