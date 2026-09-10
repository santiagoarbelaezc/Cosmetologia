import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User, ROLE_LABELS } from '../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-zinc-100/90 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      
      <!-- Contenedor Principal Más Ancho y Limpio -->
      <div class="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-zinc-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 animate-fade-in">
        
        <!-- ═════════════════════════════════════════════════════════ -->
        <!-- COLUMNA IZQUIERDA: Acceso Rápido                          -->
        <!-- ═════════════════════════════════════════════════════════ -->
        <aside class="lg:col-span-5 bg-zinc-50/80 border-r border-zinc-200/80 p-6 sm:p-8 flex flex-col justify-between">
          <div class="space-y-4">
            
            <!-- Section Header (Limpio y directo) -->
            <div>
              <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
                Acceso Rápido
              </h2>
              <p class="text-sm text-zinc-500 mt-1">
                Haz clic en un perfil para ingresar directamente:
              </p>
            </div>

            <!-- User Cards List -->
            <div class="space-y-2.5 pt-1">
              @for (user of mockUsers; track user.id) {
                <div
                  (click)="selectUser(user)"
                  class="p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer text-left relative group bg-white/90 border-zinc-200/90 hover:bg-white hover:border-zinc-950 hover:shadow-md hover:scale-[1.01]"
                >
                  <div class="flex items-center justify-between gap-3">
                    <!-- User Avatar + Info -->
                    <div class="flex items-center gap-3 min-w-0">
                      <div
                        class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors bg-zinc-100 text-zinc-700 group-hover:bg-zinc-950 group-hover:text-white"
                      >
                        {{ user.name.charAt(0) }}
                      </div>

                      <div class="min-w-0">
                        <h4 class="text-sm sm:text-base font-bold text-zinc-900 truncate">
                          {{ user.name }}
                        </h4>
                        <p class="text-xs sm:text-sm font-medium text-zinc-500">
                          {{ getRoleLabel(user.role) }}
                        </p>
                      </div>
                    </div>

                    <!-- Direct Access CTA -->
                    <span class="text-xs sm:text-sm font-bold text-zinc-400 group-hover:text-zinc-950 transition-colors flex items-center gap-1">
                      <span>Ingresar</span>
                      <span class="transition-transform group-hover:translate-x-0.5">→</span>
                    </span>
                  </div>
                </div>
              }
            </div>

          </div>
        </aside>

        <!-- ═════════════════════════════════════════════════════════ -->
        <!-- COLUMNA DERECHA: Formulario de Inicio de Sesión          -->
        <!-- ═════════════════════════════════════════════════════════ -->
        <main class="lg:col-span-7 bg-white p-6 sm:p-10 lg:p-12 flex items-center justify-center">
          <div class="w-full max-w-md space-y-6">
            
            <!-- Clinic Branding & Title -->
            <div class="text-center sm:text-left space-y-2">
              <div>
                <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 uppercase">
                  Mantra Group
                </h1>
                <p class="text-xs sm:text-sm font-bold tracking-wide text-amber-700/90 uppercase mt-1">
                  Centro Estético Corporal y Facial
                </p>
              </div>
              <p class="text-xs text-zinc-400 font-medium pt-1">
                Portal clínico de gestión médica, estética y terapéutica.
              </p>
            </div>

            <!-- Active Selected User Indicator Banner (Solo cuando está seleccionado) -->
            @if (selectedUser(); as user) {
              <div class="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/90 flex items-center justify-between gap-3 animate-fade-in">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {{ user.name.charAt(0) }}
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-bold text-zinc-900 truncate">
                      {{ user.name }}
                    </p>
                    <p class="text-xs text-zinc-500 font-medium truncate">
                      {{ getRoleLabel(user.role) }}
                    </p>
                  </div>
                </div>
                <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Listo
                </span>
              </div>
            }

            <!-- Prototype Validation Alert (Required by user) -->
            @if (errorMessage()) {
              <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold flex items-center gap-3 animate-slide-up shadow-xs">
                <svg class="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <!-- Login Form -->
            <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-4">
              <div>
                <label class="label text-sm font-medium">Correo Electrónico</label>
                <input
                  type="email"
                  formControlName="email"
                  class="input-premium py-2.5 text-sm"
                  placeholder="correo@esteticaclinic.com"
                  autocomplete="email"
                />
              </div>

              <div>
                <label class="label text-sm font-medium">Contraseña</label>
                <input
                  type="password"
                  formControlName="password"
                  class="input-premium py-2.5 text-sm"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
              </div>

              <div class="flex items-center justify-between text-xs sm:text-sm pt-1">
                <label class="flex items-center gap-2 cursor-pointer text-zinc-600">
                  <input type="checkbox" class="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black/10" checked />
                  <span>Recordarme</span>
                </label>
                <span class="text-zinc-400 hover:text-zinc-600 cursor-pointer">¿Olvidaste tu contraseña?</span>
              </div>

              <!-- Iniciar Sesión Submit Button -->
              <button
                type="submit"
                class="btn-primary w-full py-3 text-sm sm:text-base font-bold shadow-sm transition-all mt-2 cursor-pointer"
              >
                Iniciar Sesión
              </button>

              <div class="text-center pt-2">
                <a
                  routerLink="/"
                  class="text-xs font-semibold text-zinc-400 hover:text-zinc-800 transition-colors"
                >
                  ← Volver a la Landing de Pacientes
                </a>
              </div>
            </form>

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

    // Pre-populate the form
    this.loginForm.patchValue({
      email: user.email,
      password: 'password123',
    });

    // Auto-login and navigate immediately to dashboard
    const success = this.authService.login(user.email, 'password123');
    if (success) {
      this.router.navigate(['/dashboard']);
    }
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
