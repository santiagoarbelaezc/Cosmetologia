export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta';
export type ExpenseCategory = 'insumo-medico' | 'operativo' | 'administrativo';

export interface PaymentRecord {
  id: string;
  patientId: string;
  treatmentId: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  registeredBy: string;
  notes?: string;
}

export interface ExpenseItem {
  id: string;
  concept: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  registeredBy: string;
}

export interface AccountBalance {
  totalCost: number;
  totalPaid: number;
  pendingBalance: number;
}

export interface FinancialSummary {
  totalCollected: number;
  totalExpenses: number;
  netBalance: number;
}
