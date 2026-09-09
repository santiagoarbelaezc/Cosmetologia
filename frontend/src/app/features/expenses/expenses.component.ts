import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { AuthService } from '../../core/services/auth.service';
import { CurrencyCopPipe } from '../../shared/pipes/currency-cop.pipe';
import { PillTabsComponent } from '../../shared/components/pill-tabs/pill-tabs.component';
import { ExpenseCategory } from '../../core/models/finance.model';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyCopPipe, PillTabsComponent],
  template: `
    <div class="animate-fade-in">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-zinc-900">Gastos e Insumos</h1>
          <p class="text-sm text-zinc-400 mt-0.5">Control de egresos y balance de caja</p>
        </div>
        <button (click)="showAddExpense.set(true)" class="btn-primary">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Agregar Gasto
        </button>
      </div>

      <!-- Financial Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div class="card p-5">
          <p class="micro-label mb-1">Total Cobrado</p>
          <p class="text-2xl font-bold tracking-tight text-zinc-900">
            {{ dataService.financialSummary().totalCollected | currencyCop }}
          </p>
          <p class="text-[10px] text-zinc-400 mt-1">Ingresos por tratamientos</p>
        </div>
        <div class="card p-5">
          <p class="micro-label mb-1">Total Gastos</p>
          <p class="text-2xl font-bold tracking-tight text-rose-500">
            {{ dataService.financialSummary().totalExpenses | currencyCop }}
          </p>
          <p class="text-[10px] text-zinc-400 mt-1">Egresos acumulados</p>
        </div>
        <div class="card p-5">
          <p class="micro-label mb-1">Balance Neto en Caja</p>
          <p class="text-2xl font-bold tracking-tight"
             [class.text-emerald-600]="dataService.financialSummary().netBalance >= 0"
             [class.text-rose-600]="dataService.financialSummary().netBalance < 0"
          >
            {{ dataService.financialSummary().netBalance | currencyCop }}
          </p>
          <p class="text-[10px] text-zinc-400 mt-1">Cobrado − Gastos</p>
        </div>
      </div>

      <!-- Category Filter Tabs -->
      <div class="mb-6">
        <app-pill-tabs
          [tabs]="categoryTabs"
          [activeTab]="activeFilter()"
          (tabChange)="activeFilter.set($event)"
        />
      </div>

      <!-- Expenses Table -->
      <div class="card overflow-hidden">
        <!-- Table Header -->
        <div class="grid grid-cols-12 gap-4 px-5 py-3 bg-zinc-50/80 border-b border-zinc-200/80">
          <span class="col-span-2 micro-label">Fecha</span>
          <span class="col-span-4 micro-label">Concepto</span>
          <span class="col-span-2 micro-label">Categoría</span>
          <span class="col-span-2 micro-label text-right">Monto</span>
          <span class="col-span-2 micro-label text-right">Registrado por</span>
        </div>

        <!-- Table Body -->
        @for (expense of filteredExpenses(); track expense.id) {
          <div class="grid grid-cols-12 gap-4 px-5 py-4 border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/50 transition-colors">
            <span class="col-span-2 text-sm text-zinc-500">{{ expense.date | date:'d MMM' }}</span>
            <span class="col-span-4 text-sm font-medium text-zinc-800">{{ expense.concept }}</span>
            <span class="col-span-2">
              <span [class]="getCategoryBadgeClass(expense.category)">
                {{ getCategoryLabel(expense.category) }}
              </span>
            </span>
            <span class="col-span-2 text-sm font-bold text-zinc-900 text-right">{{ expense.amount | currencyCop }}</span>
            <span class="col-span-2 text-xs text-zinc-400 text-right">{{ expense.registeredBy }}</span>
          </div>
        }

        @if (filteredExpenses().length === 0) {
          <div class="text-center py-12">
            <p class="text-sm text-zinc-400">No hay gastos en esta categoría</p>
          </div>
        }
      </div>
    </div>

    <!-- Add Expense Modal -->
    @if (showAddExpense()) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 animate-fade-in"
        (click)="showAddExpense.set(false)"
      ></div>

      <!-- Modal -->
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          class="bg-white rounded-3xl shadow-2xl w-full max-w-md pointer-events-auto animate-scale-in"
          (click)="$event.stopPropagation()"
        >
          <div class="px-8 pt-8 pb-4">
            <div class="flex items-center justify-between mb-1">
              <h2 class="text-lg font-bold tracking-tight text-zinc-900">Agregar Gasto</h2>
              <button
                type="button"
                (click)="showAddExpense.set(false)"
                class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-colors"
              >
                <svg class="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <form [formGroup]="expenseForm" (ngSubmit)="submitExpense()" class="px-8 pb-8">
            <div class="mb-5">
              <label class="label">Concepto</label>
              <input type="text" formControlName="concept" class="input-premium" placeholder="Descripción del gasto" />
            </div>

            <div class="mb-5">
              <label class="label">Categoría</label>
              <select formControlName="category" class="input-premium">
                <option value="insumo-medico">Insumo Médico</option>
                <option value="operativo">Operativo</option>
                <option value="administrativo">Administrativo</option>
              </select>
            </div>

            <div class="mb-6">
              <label class="label">Monto</label>
              <div class="relative">
                <span class="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-zinc-300">$</span>
                <input
                  type="text"
                  formControlName="amount"
                  class="input-premium-lg pl-10"
                  placeholder="0"
                  (input)="formatExpenseAmount($event)"
                />
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button type="button" (click)="showAddExpense.set(false)" class="btn-ghost flex-1">
                Cancelar
              </button>
              <button
                type="submit"
                class="btn-primary flex-1"
                [disabled]="expenseForm.invalid"
              >
                Registrar Gasto
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class ExpensesComponent {
  readonly dataService = inject(MockDataService);
  readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly showAddExpense = signal(false);
  readonly activeFilter = signal('Todos');
  readonly categoryTabs = ['Todos', 'Insumo Médico', 'Operativo', 'Administrativo'];

  private expenseRawAmount = 0;

  readonly expenseForm = this.fb.group({
    concept: ['', Validators.required],
    category: ['insumo-medico' as ExpenseCategory, Validators.required],
    amount: ['', Validators.required],
  });

  private readonly categoryFilterMap: Record<string, ExpenseCategory | null> = {
    'Todos': null,
    'Insumo Médico': 'insumo-medico',
    'Operativo': 'operativo',
    'Administrativo': 'administrativo',
  };

  readonly filteredExpenses = computed(() => {
    const filter = this.categoryFilterMap[this.activeFilter()];
    const expenses = this.dataService.expenses();
    if (!filter) return expenses;
    return expenses.filter(e => e.category === filter);
  });

  getCategoryLabel(category: ExpenseCategory): string {
    const labels: Record<ExpenseCategory, string> = {
      'insumo-medico': 'Insumo Médico',
      'operativo': 'Operativo',
      'administrativo': 'Administrativo',
    };
    return labels[category];
  }

  getCategoryBadgeClass(category: ExpenseCategory): string {
    const base = 'badge text-[10px]';
    const classes: Record<ExpenseCategory, string> = {
      'insumo-medico': `${base} bg-blue-50 text-blue-600`,
      'operativo': `${base} bg-amber-50 text-amber-600`,
      'administrativo': `${base} bg-violet-50 text-violet-600`,
    };
    return classes[category];
  }

  formatExpenseAmount(event: Event): void {
    const input = event.target as HTMLInputElement;
    const numeric = input.value.replace(/\D/g, '');
    this.expenseRawAmount = numeric ? parseInt(numeric, 10) : 0;
    if (this.expenseRawAmount > 0) {
      input.value = new Intl.NumberFormat('es-CO').format(this.expenseRawAmount);
    } else {
      input.value = '';
    }
    this.expenseForm.get('amount')?.setValue(input.value, { emitEvent: false });
  }

  submitExpense(): void {
    if (this.expenseForm.invalid || this.expenseRawAmount <= 0) return;

    this.dataService.addExpense({
      concept: this.expenseForm.get('concept')?.value || '',
      category: this.expenseForm.get('category')?.value as ExpenseCategory,
      amount: this.expenseRawAmount,
      date: new Date().toISOString().split('T')[0],
      registeredBy: this.authService.currentUser()?.name || 'Sistema',
    });

    this.expenseForm.reset({ category: 'insumo-medico' });
    this.expenseRawAmount = 0;
    this.showAddExpense.set(false);
  }
}
