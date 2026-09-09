import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Progreso
        </span>
        <span class="text-sm font-semibold text-zinc-700">
          Sesión {{ current() }} de {{ total() }}
        </span>
      </div>
      <div class="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-black rounded-full transition-all duration-500 ease-out"
          [style.width.%]="percentage()"
        ></div>
      </div>
    </div>
  `,
})
export class ProgressBarComponent {
  current = input.required<number>();
  total = input.required<number>();

  percentage = computed(() => {
    const t = this.total();
    if (t === 0) return 0;
    return Math.min(100, Math.round((this.current() / t) * 100));
  });
}
