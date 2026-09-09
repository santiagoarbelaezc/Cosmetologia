import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { AuthService } from '../../core/services/auth.service';
import { PermissionsService } from '../../core/services/permissions.service';
import { CurrencyCopPipe } from '../../shared/pipes/currency-cop.pipe';
import { PillTabsComponent } from '../../shared/components/pill-tabs/pill-tabs.component';
import { ExpenseCategory, ExpenseItem } from '../../core/models/finance.model';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyCopPipe, PillTabsComponent],
  template: `
    <div class="animate-fade-in space-y-7 w-full">

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- Header                                                    -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <section class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-100">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="micro-label">Módulo Financiero</span>
            <span class="text-zinc-300">·</span>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 uppercase tracking-wider">
              Control de Caja
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Gastos e Insumos</h1>
          <p class="text-sm text-zinc-500 mt-0.5">Control de egresos, compras de insumos médicos y balance de caja</p>
        </div>

        <button (click)="showAddExpense.set(true)" class="btn-primary text-xs sm:text-sm px-5 py-2.5 shadow-sm self-start sm:self-auto">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Registrar Gasto
        </button>
      </section>

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- Financial Summary Cards                                   -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <section>
        <div class="grid grid-cols-1 gap-4"
             [ngClass]="permissions.canViewNetBalance() ? 'sm:grid-cols-3' : 'sm:grid-cols-2'">
          
          <!-- Total Cobrado -->
          <div class="card p-5 bg-white border border-zinc-200/90 hover:border-zinc-300 transition-colors">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Cobrado</span>
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <p class="text-xl font-bold text-zinc-900 tracking-tight my-1">
              {{ dataService.financialSummary().totalCollected | currencyCop }}
            </p>
            <p class="text-xs text-zinc-400">Ingresos por tratamientos</p>
          </div>

          <!-- Total Gastos -->
          <div class="card p-5 bg-white border border-zinc-200/90 hover:border-zinc-300 transition-colors">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Gastos</span>
              <span class="w-2 h-2 rounded-full bg-rose-500"></span>
            </div>
            <p class="text-xl font-bold text-rose-600 tracking-tight my-1">
              {{ dataService.financialSummary().totalExpenses | currencyCop }}
            </p>
            <p class="text-xs text-zinc-400">Egresos acumulados</p>
          </div>

          <!-- Balance Neto — SOLO GERENTE -->
          @if (permissions.canViewNetBalance()) {
            <div class="card p-5 bg-zinc-900 text-white border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold uppercase tracking-wider text-zinc-400">Balance Neto</span>
                <span class="w-2 h-2 rounded-full"
                      [class.bg-emerald-400]="dataService.financialSummary().netBalance >= 0"
                      [class.bg-rose-400]="dataService.financialSummary().netBalance < 0"></span>
              </div>
              <p class="text-xl font-bold tracking-tight my-1"
                 [class.text-emerald-400]="dataService.financialSummary().netBalance >= 0"
                 [class.text-rose-400]="dataService.financialSummary().netBalance < 0">
                {{ dataService.financialSummary().netBalance | currencyCop }}
              </p>
              <p class="text-xs text-zinc-400">Utilidad neta del centro</p>
            </div>
          }
        </div>
      </section>

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- Category Filter, Search & Table                           -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <section class="space-y-4">
        
        <!-- Controls Toolbar: Tabs + Search + Items per Page -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <!-- Category Tabs -->
          <div class="overflow-x-auto pb-1 sm:pb-0">
            <app-pill-tabs
              [tabs]="categoryTabs"
              [activeTab]="activeFilter()"
              (tabChange)="onFilterChange($event)"
            />
          </div>

          <!-- Search Input + Page Size Selector -->
          <div class="flex items-center gap-3">
            <div class="relative min-w-[220px]">
              <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                class="input-premium pl-10 text-xs py-2 bg-zinc-50/70 border-zinc-200"
                placeholder="Buscar por concepto o responsable..."
                [value]="searchQuery()"
                (input)="onSearchChange($event)"
              />
            </div>

            <!-- Page Size -->
            <div class="flex items-center gap-1.5 text-xs text-zinc-500 flex-shrink-0">
              <span>Filas:</span>
              <select
                [value]="itemsPerPage()"
                (change)="onPageSizeChange($event)"
                class="px-2 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option [value]="5">5</option>
                <option [value]="8">8</option>
                <option [value]="12">12</option>
                <option [value]="20">20</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Expenses Table Container -->
        <div class="card overflow-hidden bg-white border border-zinc-200/90 shadow-xs">
          
          <!-- Table Header -->
          <div class="grid grid-cols-12 gap-4 px-5 py-3.5 bg-zinc-50/80 border-b border-zinc-200/80 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <span class="col-span-2">Fecha</span>
            <span class="col-span-4">Concepto del Gasto</span>
            <span class="col-span-2">Categoría</span>
            <span class="col-span-2 text-right">Monto</span>
            <span class="col-span-2 text-right">Registrado por</span>
          </div>

          <!-- Table Rows -->
          @for (expense of paginatedExpenses(); track expense.id) {
            <div class="grid grid-cols-12 gap-4 px-5 py-4 border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/60 transition-colors items-center">
              <span class="col-span-2 text-xs font-medium text-zinc-500">{{ expense.date | date:'d MMM yyyy' }}</span>
              <div class="col-span-4 min-w-0">
                <p class="text-sm font-semibold text-zinc-900 truncate">{{ expense.concept }}</p>
                <p class="text-[11px] text-zinc-400 font-mono">ID: {{ expense.id }}</p>
              </div>
              <span class="col-span-2">
                <span [ngClass]="getCategoryBadgeClass(expense.category)">
                  {{ getCategoryLabel(expense.category) }}
                </span>
              </span>
              <span class="col-span-2 text-sm font-semibold text-zinc-900 text-right">{{ expense.amount | currencyCop }}</span>
              <span class="col-span-2 text-xs text-zinc-500 text-right truncate font-medium">{{ expense.registeredBy }}</span>
            </div>
          }

          @if (filteredExpenses().length === 0) {
            <div class="text-center py-14">
              <div class="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-3 text-zinc-400">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p class="text-sm font-semibold text-zinc-700">No se encontraron gastos</p>
              <p class="text-xs text-zinc-400 mt-1">Prueba cambiando la categoría o el término de búsqueda</p>
            </div>
          }

          <!-- ═══════════════════════════════════════════════════════ -->
          <!-- PAGINATION FOOTER BAR                                   -->
          <!-- ═══════════════════════════════════════════════════════ -->
          @if (filteredExpenses().length > 0) {
            <div class="px-5 py-3.5 bg-zinc-50/50 border-t border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              
              <!-- Record counts -->
              <div class="text-zinc-500 font-medium">
                Mostrando <span class="font-bold text-zinc-900">{{ startIndex() }}</span> a 
                <span class="font-bold text-zinc-900">{{ endIndex() }}</span> de 
                <span class="font-bold text-zinc-900">{{ filteredExpenses().length }}</span> registros
              </div>

              <!-- Pagination Navigation Buttons -->
              <div class="flex items-center gap-1.5 self-center sm:self-auto">
                
                <!-- Anterior -->
                <button
                  (click)="prevPage()"
                  [disabled]="currentPage() === 1"
                  class="px-3 py-1.5 rounded-lg border border-zinc-200 font-semibold transition-all flex items-center gap-1"
                  [ngClass]="currentPage() === 1 ? 'opacity-40 cursor-not-allowed bg-zinc-50 text-zinc-400' : 'bg-white text-zinc-700 hover:bg-zinc-100 cursor-pointer'"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  Anterior
                </button>

                <!-- Page Number Pills -->
                <div class="flex items-center gap-1">
                  @for (page of visiblePageNumbers(); track page) {
                    <button
                      (click)="goToPage(page)"
                      class="w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer"
                      [ngClass]="currentPage() === page 
                        ? 'bg-zinc-900 text-white shadow-xs' 
                        : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'"
                    >
                      {{ page }}
                    </button>
                  }
                </div>

                <!-- Siguiente -->
                <button
                  (click)="nextPage()"
                  [disabled]="currentPage() === totalPages()"
                  class="px-3 py-1.5 rounded-lg border border-zinc-200 font-semibold transition-all flex items-center gap-1"
                  [ngClass]="currentPage() === totalPages() ? 'opacity-40 cursor-not-allowed bg-zinc-50 text-zinc-400' : 'bg-white text-zinc-700 hover:bg-zinc-100 cursor-pointer'"
                >
                  Siguiente
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>

              </div>
            </div>
          }

        </div>
      </section>
    </div>

    <!-- ═════════════════════════════════════════════════════════ -->
    <!-- Add Expense Modal                                         -->
    <!-- ═════════════════════════════════════════════════════════ -->
    @if (showAddExpense()) {
      <div class="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 animate-fade-in" (click)="showAddExpense.set(false)"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md pointer-events-auto animate-scale-in" (click)="$event.stopPropagation()">
          <div class="px-8 pt-8 pb-4">
            <div class="flex items-center justify-between mb-1">
              <h2 class="text-lg font-bold tracking-tight text-zinc-900">Agregar Gasto</h2>
              <button type="button" (click)="showAddExpense.set(false)" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-colors">
                <svg class="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <form [formGroup]="expenseForm" (ngSubmit)="submitExpense()" class="px-8 pb-8">
            <div class="mb-5">
              <label class="label">Concepto</label>
              <input type="text" formControlName="concept" class="input-premium" placeholder="Descripción del gasto o insumo" />
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
                <input type="text" formControlName="amount" class="input-premium-lg pl-10" placeholder="0" (input)="formatExpenseAmount($event)" />
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button type="button" (click)="showAddExpense.set(false)" class="btn-ghost flex-1">Cancelar</button>
              <button type="submit" class="btn-primary flex-1" [disabled]="expenseForm.invalid">Registrar Gasto</button>
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
  readonly permissions = inject(PermissionsService);
  private readonly fb = inject(FormBuilder);

  readonly showAddExpense = signal(false);
  readonly activeFilter = signal('Todos');
  readonly searchQuery = signal('');
  readonly categoryTabs = ['Todos', 'Insumo Médico', 'Operativo', 'Administrativo'];

  // Pagination Signals
  readonly currentPage = signal(1);
  readonly itemsPerPage = signal(5);

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
    const query = this.searchQuery().toLowerCase().trim();
    let expenses = this.dataService.expenses();

    if (filter) {
      expenses = expenses.filter(e => e.category === filter);
    }

    if (query) {
      expenses = expenses.filter(e =>
        e.concept.toLowerCase().includes(query) ||
        e.registeredBy.toLowerCase().includes(query) ||
        e.id.toLowerCase().includes(query)
      );
    }

    return expenses;
  });

  readonly totalPages = computed(() => {
    const total = this.filteredExpenses().length;
    const perPage = this.itemsPerPage();
    return Math.max(1, Math.ceil(total / perPage));
  });

  readonly paginatedExpenses = computed(() => {
    const expenses = this.filteredExpenses();
    const page = this.currentPage();
    const perPage = this.itemsPerPage();
    const start = (page - 1) * perPage;
    return expenses.slice(start, start + perPage);
  });

  readonly startIndex = computed(() => {
    if (this.filteredExpenses().length === 0) return 0;
    return (this.currentPage() - 1) * this.itemsPerPage() + 1;
  });

  readonly endIndex = computed(() => {
    const end = this.currentPage() * this.itemsPerPage();
    return Math.min(end, this.filteredExpenses().length);
  });

  readonly visiblePageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    // Show up to 5 page numbers gracefully
    const maxButtons = 5;
    let startPage = Math.max(1, current - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;

    if (endPage > total) {
      endPage = total;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  });

  onFilterChange(tab: string): void {
    this.activeFilter.set(tab);
    this.currentPage.set(1);
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage.set(1);
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.itemsPerPage.set(parseInt(select.value, 10));
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  getCategoryLabel(category: ExpenseCategory): string {
    const labels: Record<ExpenseCategory, string> = {
      'insumo-medico': 'Insumo Médico',
      'operativo': 'Operativo',
      'administrativo': 'Administrativo',
    };
    return labels[category];
  }

  getCategoryBadgeClass(category: ExpenseCategory): string {
    const base = 'badge text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full';
    const classes: Record<ExpenseCategory, string> = {
      'insumo-medico': `${base} bg-blue-50 text-blue-700 border border-blue-200/70`,
      'operativo': `${base} bg-amber-50 text-amber-700 border border-amber-200/70`,
      'administrativo': `${base} bg-violet-50 text-violet-700 border border-violet-200/70`,
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
