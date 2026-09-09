import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pill-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center rounded-full bg-zinc-100 p-1 gap-0.5">
      @for (tab of tabs(); track tab) {
        <button
          type="button"
          (click)="selectTab(tab)"
          [class]="tab === activeTab()
            ? 'px-5 py-2 rounded-full text-sm font-semibold bg-black text-white shadow-sm transition-all duration-200 ease-out'
            : 'px-5 py-2 rounded-full text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-all duration-200 ease-out'
          "
        >
          {{ tab }}
        </button>
      }
    </div>
  `,
})
export class PillTabsComponent {
  tabs = input.required<string[]>();
  activeTab = input.required<string>();
  tabChange = output<string>();

  selectTab(tab: string): void {
    this.tabChange.emit(tab);
  }
}
