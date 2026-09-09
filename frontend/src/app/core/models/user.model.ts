export type UserRole = 'gerente' | 'administradora' | 'medico' | 'cosmetologa';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  specialty: UserSpecialty;
  avatarUrl?: string;
}

/**
 * Maps each role to its clinical specialty scope.
 * - 'all' → can see both treatment categories
 * - 'medico-no-invasivo' → only medical procedures
 * - 'corporal-cosmetologia' → only body/cosmetic services
 * - 'none' → no clinical scope (admin only)
 */
export type UserSpecialty = 'all' | 'medico-no-invasivo' | 'corporal-cosmetologia' | 'none';

/** Human-readable labels */
export const ROLE_LABELS: Record<UserRole, string> = {
  gerente: 'Gerente',
  administradora: 'Administradora',
  medico: 'Médico',
  cosmetologa: 'Cosmetóloga',
};
