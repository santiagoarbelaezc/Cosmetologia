import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  readonly isCollapsed = signal(false);
  readonly isMobileOpen = signal(false);

  toggle(): void {
    this.isCollapsed.update(v => !v);
  }

  setCollapsed(collapsed: boolean): void {
    this.isCollapsed.set(collapsed);
  }

  toggleMobile(): void {
    this.isMobileOpen.update(v => !v);
  }

  openMobile(): void {
    this.isMobileOpen.set(true);
  }

  closeMobile(): void {
    this.isMobileOpen.set(false);
  }
}
