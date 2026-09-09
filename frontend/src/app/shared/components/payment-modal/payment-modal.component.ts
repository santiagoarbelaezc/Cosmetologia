import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { PillTabsComponent } from '../pill-tabs/pill-tabs.component';
import { CurrencyCopPipe } from '../../pipes/currency-cop.pipe';
import { Treatment } from '../../../core/models/patient.model';
import { PaymentMethod } from '../../../core/models/finance.model';

export interface PaymentFormData {
  treatmentId: string;
  amount: number;
  method: PaymentMethod;
  notes: string;
}

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PillTabsComponent, CurrencyCopPipe],
  template: `
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 animate-fade-in"
      (click)="close()"
    ></div>

    <!-- Modal Card -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div
        class="bg-white rounded-3xl shadow-2xl w-full max-w-md pointer-events-auto animate-scale-in"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="px-8 pt-8 pb-4">
          <div class="flex items-center justify-between mb-1">
            <h2 class="text-lg font-bold tracking-tight text-zinc-900">Registrar Abono</h2>
            <button
              type="button"
              (click)="close()"
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-colors"
            >
              <svg class="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p class="text-sm text-zinc-400">{{ patientName() }}</p>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="submitPayment()" class="px-8 pb-8">
          <!-- Treatment Selector -->
          @if (treatments().length > 1) {
            <div class="mb-5">
              <label class="label">Tratamiento</label>
              <select formControlName="treatmentId" class="input-premium">
                @for (t of treatments(); track t.id) {
                  <option [value]="t.id">{{ t.name }}</option>
                }
              </select>
            </div>
          }

          <!-- Amount Input -->
          <div class="mb-5">
            <label class="label">Monto del Abono</label>
            <div class="relative">
              <span class="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-zinc-300">$</span>
              <input
                type="text"
                formControlName="amount"
                class="input-premium-lg pl-10"
                placeholder="0"
                (input)="formatAmount($event)"
              />
            </div>
            @if (selectedTreatmentBalance() > 0) {
              <p class="mt-1.5 text-xs text-zinc-400">
                Saldo pendiente:
                <span class="font-semibold text-zinc-600">{{ selectedTreatmentBalance() | currencyCop }}</span>
              </p>
            }
          </div>

          <!-- Payment Method -->
          <div class="mb-5">
            <label class="label">Método de Pago</label>
            <div class="flex items-center gap-1 bg-zinc-100 rounded-full p-1">
              @for (method of paymentMethods; track method.value) {
                <button
                  type="button"
                  (click)="setMethod(method.value)"
                  [class]="form.get('method')?.value === method.value
                    ? 'flex-1 py-2.5 rounded-full text-xs font-semibold bg-black text-white shadow-sm transition-all duration-200'
                    : 'flex-1 py-2.5 rounded-full text-xs font-medium text-zinc-500 hover:text-zinc-700 transition-all duration-200'
                  "
                >
                  {{ method.label }}
                </button>
              }
            </div>
          </div>

          <!-- Notes -->
          <div class="mb-6">
            <label class="label">Notas (opcional)</label>
            <textarea
              formControlName="notes"
              rows="2"
              class="input-premium resize-none"
              placeholder="Observaciones del pago..."
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <button type="button" (click)="close()" class="btn-ghost flex-1">
              Cancelar
            </button>
            <button
              type="submit"
              class="btn-primary flex-1"
              [disabled]="form.invalid || !hasValidAmount()"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Registrar Abono
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class PaymentModalComponent {
  private readonly fb = inject(FormBuilder);

  patientName = input.required<string>();
  treatments = input.required<Treatment[]>();
  modalClose = output<void>();
  paymentSubmit = output<PaymentFormData>();

  readonly paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'tarjeta', label: 'Tarjeta' },
  ];

  readonly form: FormGroup = this.fb.group({
    treatmentId: ['', Validators.required],
    amount: ['', Validators.required],
    method: ['efectivo' as PaymentMethod, Validators.required],
    notes: [''],
  });

  private rawAmount = 0;

  constructor() {
    // Set default treatment when treatments are loaded
    setTimeout(() => {
      const treatments = this.treatments();
      if (treatments.length > 0) {
        this.form.patchValue({ treatmentId: treatments[0].id });
      }
    });
  }

  selectedTreatmentBalance(): number {
    const treatmentId = this.form.get('treatmentId')?.value;
    const treatment = this.treatments().find(t => t.id === treatmentId);
    if (!treatment) return 0;
    return treatment.totalCost - treatment.totalPaid;
  }

  formatAmount(event: Event): void {
    const input = event.target as HTMLInputElement;
    const numeric = input.value.replace(/\D/g, '');
    this.rawAmount = numeric ? parseInt(numeric, 10) : 0;
    if (this.rawAmount > 0) {
      input.value = new Intl.NumberFormat('es-CO').format(this.rawAmount);
    } else {
      input.value = '';
    }
    this.form.get('amount')?.setValue(input.value, { emitEvent: false });
  }

  hasValidAmount(): boolean {
    return this.rawAmount > 0;
  }

  setMethod(method: PaymentMethod): void {
    this.form.patchValue({ method });
  }

  submitPayment(): void {
    if (this.form.invalid || !this.hasValidAmount()) return;

    const formData: PaymentFormData = {
      treatmentId: this.form.get('treatmentId')?.value,
      amount: this.rawAmount,
      method: this.form.get('method')?.value,
      notes: this.form.get('notes')?.value || '',
    };

    this.paymentSubmit.emit(formData);
    this.close();
  }

  close(): void {
    this.modalClose.emit();
  }
}
