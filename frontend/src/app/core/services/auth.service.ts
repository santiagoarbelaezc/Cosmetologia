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

  readonly isAdmin = computed(() => {
    const role = this.currentRole();
    return role === 'gerente' || role === 'administradora';
  });

  readonly isClinical = computed(() => {
    const role = this.currentRole();
    return role === 'medico' || role === 'cosmetologa';
  });

  /** Mock users for the system */
  private readonly mockUsers: User[] = [
    {
      id: 'usr-001',
      name: 'Carolina Méndez',
      email: 'carolina@esteticaclinic.com',
      role: 'gerente',
    },
    {
      id: 'usr-002',
      name: 'Valentina Ríos',
      email: 'valentina@esteticaclinic.com',
      role: 'administradora',
    },
    {
      id: 'usr-003',
      name: 'Dr. Andrés Castaño',
      email: 'andres@esteticaclinic.com',
      role: 'medico',
    },
    {
      id: 'usr-004',
      name: 'Camila Herrera',
      email: 'camila@esteticaclinic.com',
      role: 'cosmetologa',
    },
  ];

  login(email: string, _password: string): boolean {
    const user = this.mockUsers.find(u => u.email === email);
    if (user) {
      this._currentUser.set(user);
      return true;
    }
    // Default: log in as gerente for demo purposes
    this._currentUser.set(this.mockUsers[0]);
    return true;
  }

  logout(): void {
    this._currentUser.set(null);
  }

  switchRole(role: UserRole): void {
    const user = this.mockUsers.find(u => u.role === role);
    if (user) {
      this._currentUser.set(user);
    }
  }

  hasRole(...roles: UserRole[]): boolean {
    const currentRole = this.currentRole();
    return currentRole !== null && roles.includes(currentRole);
  }

  getMockUsers(): User[] {
    return [...this.mockUsers];
  }
}
