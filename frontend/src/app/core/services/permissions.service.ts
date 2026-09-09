import { Injectable, inject, computed } from '@angular/core';
import { AuthService } from './auth.service';
import { UserRole } from '../models/user.model';
import { TreatmentCategory } from '../models/patient.model';

/**
 * Centralized permissions service implementing the RBAC matrix.
 *
 * ┌─────────────────────────────────────┬──────────┬───────────────┬─────────┬──────────────┐
 * │ Funcionalidad                       │ Gerente  │ Administradora│ Médico  │ Cosmetóloga  │
 * ├─────────────────────────────────────┼──────────┼───────────────┼─────────┼──────────────┤
 * │ Ver todos los pacientes             │ ✅        │ ✅             │ ❌ (own) │ ❌ (own)      │
 * │ Crear ficha de paciente             │ ✅        │ ✅             │ ❌       │ ❌            │
 * │ Ver tratamientos médicos            │ ✅        │ ✅ (readonly)  │ ✅       │ ❌            │
 * │ Ver tratamientos corporales         │ ✅        │ ✅ (readonly)  │ ❌       │ ✅            │
 * │ Registrar evolución clínica         │ ✅        │ ❌             │ ✅ (own) │ ✅ (own)      │
 * │ Ver costo total del tratamiento     │ ✅        │ ✅             │ ❌       │ ❌            │
 * │ Registrar abono/pago                │ ✅        │ ✅             │ ❌       │ ❌            │
 * │ Ver saldo deudor                    │ ✅        │ ✅             │ ❌       │ ❌            │
 * │ Ver balance de caja (ingresos)      │ ✅        │ ✅             │ ❌       │ ❌            │
 * │ Ver gastos/insumos                  │ ✅        │ ✅             │ ❌       │ ❌            │
 * │ Ver balance neto (utilidad)         │ ✅        │ ❌             │ ❌       │ ❌            │
 * │ Editar precios                      │ ✅        │ ❌             │ ❌       │ ❌            │
 * │ Gestionar usuarios/roles            │ ✅        │ ❌             │ ❌       │ ❌            │
 * └─────────────────────────────────────┴──────────┴───────────────┴─────────┴──────────────┘
 */
@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private readonly auth = inject(AuthService);

  private readonly role = computed(() => this.auth.currentRole());

  // ─── Patient Visibility ─────────────────────────────────

  /** Can see the full list of patients (vs only assigned) */
  readonly canViewAllPatients = computed(() =>
    this.is('gerente', 'administradora')
  );

  readonly canCreatePatient = computed(() =>
    this.is('gerente', 'administradora')
  );

  // ─── Treatment Visibility ───────────────────────────────

  /** Returns which treatment categories the current user can see */
  readonly visibleTreatmentCategories = computed<TreatmentCategory[]>(() => {
    const r = this.role();
    switch (r) {
      case 'gerente':
      case 'administradora':
        return ['corporal-cosmetologia', 'medico-no-invasivo'];
      case 'medico':
        return ['medico-no-invasivo'];
      case 'cosmetologa':
        return ['corporal-cosmetologia'];
      default:
        return [];
    }
  });

  /** Whether the user can edit treatments (not just view) */
  readonly canEditTreatments = computed(() =>
    this.is('gerente', 'medico', 'cosmetologa')
  );

  /** Administradora can view treatments but read-only */
  readonly treatmentsReadOnly = computed(() =>
    this.is('administradora')
  );

  // ─── Clinical History & Prescriptions ─────────────────

  /** Can register clinical evolution notes */
  readonly canRegisterEvolution = computed(() =>
    this.is('gerente', 'medico', 'cosmetologa')
  );

  /** Can create or update patient's medical history (Doctor & Gerente) */
  readonly canCreateMedicalRecord = computed(() =>
    this.is('gerente', 'medico')
  );

  /** Can prescribe / formulate treatments (Doctor & Gerente) */
  readonly canPrescribeTreatments = computed(() =>
    this.is('gerente', 'medico')
  );

  // ─── Financial Permissions ──────────────────────────────

  /** Can see treatment costs, balances, payments */
  readonly canViewFinancials = computed(() =>
    this.is('gerente', 'administradora')
  );

  /** Can register payments/abonos */
  readonly canRegisterPayment = computed(() =>
    this.is('gerente', 'administradora')
  );

  /** Can see cash balance (total collected, total expenses) */
  readonly canViewCashBalance = computed(() =>
    this.is('gerente', 'administradora')
  );

  /** Can see net balance (profit = revenue - expenses). Gerente ONLY. */
  readonly canViewNetBalance = computed(() =>
    this.is('gerente')
  );

  /** Can view expenses/supplies section */
  readonly canViewExpenses = computed(() =>
    this.is('gerente', 'administradora')
  );

  // ─── Admin / Strategic ──────────────────────────────────

  /** Can edit treatment prices */
  readonly canEditPrices = computed(() =>
    this.is('gerente')
  );

  /** Can manage users and roles */
  readonly canManageUsers = computed(() =>
    this.is('gerente')
  );

  // ─── Helpers ────────────────────────────────────────────

  private is(...roles: UserRole[]): boolean {
    const r = this.role();
    return r !== null && roles.includes(r);
  }

  /**
   * Whether the user can see a specific treatment category.
   */
  canViewCategory(category: TreatmentCategory): boolean {
    return this.visibleTreatmentCategories().includes(category);
  }
}
