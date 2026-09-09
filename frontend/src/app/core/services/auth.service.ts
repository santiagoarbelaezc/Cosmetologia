import { Injectable, signal, computed } from '@angular/core';
import { User, UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _currentUser = signal<User | null>(null);
  private readonly _isAuthenticated = computed(() => this._currentUser() !== null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = this._isAuthenticated;

  readonly currentRole = computed<UserRole | null>(() => {
    const user = this._currentUser();
    return user ? user.role : null;
  });

  /** Mock users for the system — each with their clinical specialty scope */
  private readonly mockUsers: User[] = [
    {
      id: 'usr-001',
      name: 'Carolina Méndez',
      email: 'carolina@esteticaclinic.com',
      role: 'gerente',
      specialty: 'all',
    },
    {
      id: 'usr-002',
      name: 'Valentina Ríos',
      email: 'valentina@esteticaclinic.com',
      role: 'administradora',
      specialty: 'none',
    },
    {
      id: 'usr-003',
      name: 'Dr. Andrés Castaño',
      email: 'andres@esteticaclinic.com',
      role: 'medico',
      specialty: 'medico-no-invasivo',
    },
    {
      id: 'usr-004',
      name: 'Camila Herrera',
      email: 'camila@esteticaclinic.com',
      role: 'cosmetologa',
      specialty: 'corporal-cosmetologia',
    },
  ];

  login(email: string, _password: string): boolean {
    const user = this.mockUsers.find(u => u.email === email);
    if (user) {
      this._currentUser.set(user);
      return true;
    }
    return false;
  }

  logout(): void {
    this._currentUser.set(null);
  }

  hasRole(...roles: UserRole[]): boolean {
    const currentRole = this.currentRole();
    return currentRole !== null && roles.includes(currentRole);
  }

  getMockUsers(): User[] {
    return [...this.mockUsers];
  }
}
