import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PillTabsComponent } from '../../shared/components/pill-tabs/pill-tabs.component';
import { AuthService } from '../../core/services/auth.service';
import { ROLE_LABELS } from '../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PillTabsComponent],
  template: `
    <div class="min-h-screen bg-white flex items-center justify-center px-4">
      <div class="w-full max-w-sm animate-slide-up">
        <!-- Logo -->
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-14 h-14 bg-black rounded-2xl mb-5 shadow-lg shadow-black/10">
            <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-zinc-900">Estética Clinic</h1>
          <p class="text-xs font-semibold uppercase tracking-widest text-zinc-400 mt-1">Medicina Estética & Cosmetología</p>
        </div>

        <!-- Pill Tabs -->
        <div class="flex justify-center mb-8">
          <app-pill-tabs
            [tabs]="['Ingresar', 'Registrarse']"
            [activeTab]="activeTab()"
            (tabChange)="activeTab.set($event)"
          />
        </div>

        <!-- Login Form -->
        @if (activeTab() === 'Ingresar') {
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-4 animate-fade-in">
            <div>
              <label class="label">Correo Electrónico</label>
              <input
                type="email"
                formControlName="email"
                class="input-premium"
                placeholder="correo@esteticaclinic.com"
                autocomplete="email"
              />
            </div>

            <div>
              <label class="label">Contraseña</label>
              <input
                type="password"
                formControlName="password"
                class="input-premium"
                placeholder="••••••••"
                autocomplete="current-password"
              />
            </div>

            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" class="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black/10" />
                <span class="text-xs text-zinc-500">Recordarme</span>
              </label>
              <a href="#" class="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">¿Olvidaste tu contraseña?</a>
            </div>

            @if (errorMessage()) {
              <div class="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 animate-fade-in">
                <p class="text-sm text-rose-600">{{ errorMessage() }}</p>
              </div>
            }

            <button type="submit" class="btn-primary w-full py-3.5">
              Iniciar Sesión
            </button>

            <!-- Quick Access (Demo Only) -->
            <div class="mt-6 pt-6 border-t border-zinc-100">
              <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-300 text-center mb-3">
                Acceso rápido · Demo
              </p>
              <div class="space-y-2">
                @for (user of authService.getMockUsers(); track user.id) {
                  <button
                    type="button"
                    (click)="quickLogin(user.email)"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-zinc-100 hover:border-zinc-300 transition-all duration-200 group"
                  >
                    <div class="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0 group-hover:bg-zinc-300 transition-colors">
                      <span class="text-xs font-bold text-zinc-600">{{ user.name.charAt(0) }}</span>
                    </div>
                    <div class="text-left flex-1 min-w-0">
                      <p class="text-sm font-semibold text-zinc-700 truncate">{{ user.name }}</p>
                      <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">{{ getRoleLabel(user.role) }}</p>
                    </div>
                    <svg class="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                }
              </div>
            </div>
          </form>
        }

        <!-- Register Form (Placeholder) -->
        @if (activeTab() === 'Registrarse') {
          <div class="space-y-4 animate-fade-in">
            <div>
              <label class="label">Nombre Completo</label>
              <input type="text" class="input-premium" placeholder="Nombre y Apellido" />
            </div>
            <div>
              <label class="label">Correo Electrónico</label>
              <input type="email" class="input-premium" placeholder="correo@esteticaclinic.com" />
            </div>
            <div>
              <label class="label">Contraseña</label>
              <input type="password" class="input-premium" placeholder="Mínimo 8 caracteres" />
            </div>
            <div>
              <label class="label">Confirmar Contraseña</label>
              <input type="password" class="input-premium" placeholder="Repite tu contraseña" />
            </div>
            <button type="button" class="btn-primary w-full py-3.5">
              Crear Cuenta
            </button>
          </div>
        }

        <!-- Footer -->
        <p class="text-center text-[10px] text-zinc-300 mt-10">
          © 2026 Estética Clinic. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly activeTab = signal('Ingresar');
  readonly errorMessage = signal('');

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onLogin(): void {
    this.errorMessage.set('');
    const { email, password } = this.loginForm.value;
    const success = this.authService.login(email || '', password || '');
    if (success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage.set('Credenciales inválidas. Verifique su correo electrónico.');
    }
  }

  quickLogin(email: string): void {
    const success = this.authService.login(email, 'demo');
    if (success) {
      this.router.navigate(['/dashboard']);
    }
  }

  getRoleLabel(role: string): string {
    return ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role;
  }
}
