export type UserRole = 'gerente' | 'administradora' | 'medico' | 'cosmetologa';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

/** Roles that have full financial visibility */
export const ADMIN_ROLES: UserRole[] = ['gerente', 'administradora'];

/** Roles that are limited to clinical views only */
export const CLINICAL_ROLES: UserRole[] = ['medico', 'cosmetologa'];
