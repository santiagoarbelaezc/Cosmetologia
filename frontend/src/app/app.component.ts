import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    @if (authService.isAuthenticated()) {
      <!-- Authenticated Layout: Sidebar + Content -->
      <div class="flex min-h-screen bg-white">
        <app-sidebar />
        <main
          class="flex-1 transition-all duration-300 ease-out"
          [class.ml-64]="true"
        >
          <div class="max-w-6xl mx-auto px-6 lg:px-10 py-8">
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
}
