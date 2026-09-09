import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User, ROLE_LABELS } from '../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-zinc-100 flex items-center justify-center p-3 sm:p-6 lg:p-8">
      
      <!-- Contenedor Principal Centrado -->
      <div class="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-zinc-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 animate-fade-in">
        
        <!-- ═════════════════════════════════════════════════════════ -->
        <!-- COLUMNA IZQUIERDA: Acceso Rápido por Rol (Prototipo)     -->
        <!-- ═════════════════════════════════════════════════════════ -->
        <aside class="lg:col-span-5 bg-zinc-50 border-r border-zinc-200/80 p-5 sm:p-6 flex flex-col justify-between">
          <div class="space-y-4">
            
            <!-- Section Header -->
            <div>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-200/70 text-zinc-700 text-[10px] font-bold uppercase tracking-wider mb-2">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Prototipo
              </div>
              <h2 class="text-lg font-bold tracking-tight text-zinc-900">
                Acceso Rápido por Rol
              </h2>
              <p class="text-xs text-zinc-500 mt-0.5">
                Selecciona un perfil para ingresar:
              </p>
            </div>

            <!-- User Cards List (Compact) -->
            <div class="space-y-2">
              @for (user of mockUsers; track user.id) {
                <div
                  (click)="selectUser(user)"
                  class="p-2.5 sm:p-3 rounded-xl border transition-all duration-200 cursor-pointer text-left relative group"
                  [ngClass]="selectedUser()?.id === user.id 
                    ? 'bg-white border-zinc-950 ring-2 ring-zinc-950 shadow-xs' 
                    : 'bg-white/80 border-zinc-200/90 hover:bg-white hover:border-zinc-300'"
                >
                  <div class="flex items-center justify-between gap-2">
                    <!-- User Avatar + Info -->
                    <div class="flex items-center gap-2.5 min-w-0">
                      <div
                        class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors"
                        [ngClass]="selectedUser()?.id === user.id ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-700 group-hover:bg-zinc-200'"
                      >
                        {{ user.name.charAt(0) }}
                      </div>

                      <div class="min-w-0">
                        <h4 class="text-xs font-bold text-zinc-900 truncate">
                          {{ user.name }}
                        </h4>
                        <p class="text-[11px] font-medium text-zinc-500">
                          {{ getRoleLabel(user.role) }}
                        </p>
                      </div>
                    </div>

                    <!-- Badge when selected -->
                    @if (selectedUser()?.id === user.id) {
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-950 text-white flex-shrink-0">
                        <span class="w-1 h-1 rounded-full bg-emerald-400"></span>
                        Elegido
                      </span>
                    } @else {
                      <span class="text-[11px] text-zinc-300 group-hover:text-zinc-500 transition-colors font-medium">
                        Elegir →
                      </span>
                    }
                  </div>

                  <!-- Role Scope Description -->
                  <p class="text-[11px] text-zinc-500 mt-2 pt-1.5 border-t border-zinc-100/90 leading-tight">
                    {{ getRoleDescription(user.role) }}
                  </p>
                </div>
              }
            </div>

          </div>

          <!-- Left Column Footer Note -->
          <div class="pt-3 mt-3 border-t border-zinc-200/70 text-[11px] text-zinc-400 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <span>Haz clic en un perfil para cargarlo.</span>
          </div>
        </aside>

        <!-- ═════════════════════════════════════════════════════════ -->
        <!-- COLUMNA DERECHA: Formulario de Inicio de Sesión          -->
        <!-- ═════════════════════════════════════════════════════════ -->
        <main class="lg:col-span-7 bg-white p-5 sm:p-8 lg:p-10 flex items-center justify-center">
          <div class="w-full max-w-sm space-y-5">
            
            <!-- Clinic Branding & Title -->
            <div class="text-center sm:text-left space-y-1">
              <div class="inline-flex items-center justify-center w-10 h-10 bg-zinc-950 rounded-xl shadow-xs border border-zinc-800 mb-1">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              </div>
              <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
                Iniciar Sesión
              </h1>
              <p class="text-xs text-zinc-500">
                Estética Clinic · Sistema Médico & Administrativo
              </p>
            </div>

            <!-- Active Selected User Indicator Banner -->
            @if (selectedUser(); as user) {
              <div class="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/90 flex items-center justify-between gap-2 animate-fade-in">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {{ user.name.charAt(0) }}
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-zinc-900 truncate">
                      {{ user.name }}
                    </p>
                    <p class="text-[10px] text-zinc-500 font-medium truncate">
                      {{ getRoleLabel(user.role) }}
                    </p>
                  </div>
                </div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Listo
                </span>
              </div>
            } @else {
              <div class="p-2.5 rounded-xl bg-zinc-50/60 border border-dashed border-zinc-200 text-center text-xs text-zinc-400">
                Ningún usuario seleccionado.
              </div>
            }

            <!-- Prototype Validation Alert (Required by user) -->
            @if (errorMessage()) {
              <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2.5 animate-slide-up shadow-xs">
                <svg class="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <!-- Login Form -->
            <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-3.5">
              <div>
                <label class="label text-xs">Correo Electrónico</label>
                <input
                  type="email"
                  formControlName="email"
                  class="input-premium py-2 text-xs"
                  placeholder="correo@esteticaclinic.com"
                  autocomplete="email"
                />
              </div>

              <div>
                <label class="label text-xs">Contraseña</label>
                <input
                  type="password"
                  formControlName="password"
                  class="input-premium py-2 text-xs"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
              </div>

              <div class="flex items-center justify-between text-xs pt-0.5">
                <label class="flex items-center gap-1.5 cursor-pointer text-zinc-600">
                  <input type="checkbox" class="w-3.5 h-3.5 rounded border-zinc-300 text-black focus:ring-black/10" checked />
                  <span class="text-[11px]">Recordarme</span>
                </label>
                <span class="text-[11px] text-zinc-400 hover:text-zinc-600 cursor-pointer">¿Olvidaste tu contraseña?</span>
              </div>

              <!-- Iniciar Sesión Submit Button -->
              <button
                type="submit"
                class="btn-primary w-full py-2.5 text-xs font-bold shadow-sm transition-all mt-1 cursor-pointer"
              >
                Iniciar Sesión
              </button>
            </form>

            <!-- Footer Legal -->
            <p class="text-center text-[11px] text-zinc-400 pt-2">
              © 2026 Estética Clinic. Prototipo Funcional.
            </p>

          </div>
        </main>

      </div>

    </div>
  `,
})
export class LoginComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly mockUsers: User[] = this.authService.getMockUsers();
  readonly selectedUser = signal<User | null>(null);
  readonly errorMessage = signal('');

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['password123', [Validators.required]],
  });

  selectUser(user: User): void {
    this.selectedUser.set(user);
    this.errorMessage.set('');

    // Pre-populate the form for seamless prototype testing
    this.loginForm.patchValue({
      email: user.email,
      password: 'password123',
    });
  }

  onLogin(): void {
    this.errorMessage.set('');

    const user = this.selectedUser();
    const email = this.loginForm.get('email')?.value?.trim();

    // Prototype Requirement: If no user is selected or email is empty, prompt user to select one
    if (!user && !email) {
      this.errorMessage.set('Selecciona un usuario para ingresar');
      return;
    }

    const targetEmail = user ? user.email : email || '';
    const success = this.authService.login(targetEmail, 'password123');

    if (success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage.set('Selecciona un usuario para ingresar');
    }
  }

  getRoleLabel(role: string): string {
    return ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role;
  }

  getRoleDescription(role: string): string {
    switch (role) {
      case 'gerente':
        return 'Finanzas, pacientes y control global.';
      case 'administradora':
        return 'Caja, agenda y abonos.';
      case 'medico':
        return 'Procedimientos médicos · Pacientes asignados.';
      case 'cosmetologa':
        return 'Tratamientos corporales y faciales.';
      default:
        return '';
    }
  }
}
