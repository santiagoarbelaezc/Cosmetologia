import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  readonly isCollapsed = signal(false);

  toggle(): void {
    this.isCollapsed.update(v => !v);
  }

  setCollapsed(collapsed: boolean): void {
    this.isCollapsed.set(collapsed);
  }
}
