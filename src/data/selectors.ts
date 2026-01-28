import { Transaction, PeriodFilter, TypeFilter } from './types';

// Mock "today" date - consistent with FlowsTab
const MOCK_TODAY = new Date('2024-01-15');

export function filterTransactions(
  transactions: Transaction[],
  period: PeriodFilter,
  typeFilter: TypeFilter
): Transaction[] {
  const cutoff = new Date(MOCK_TODAY);
  cutoff.setDate(cutoff.getDate() - period);

  return transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    const inPeriod = txDate >= cutoff;
    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'in' && tx.type === 'in') ||
      (typeFilter === 'out' && tx.type === 'out');
    return inPeriod && matchesType;
  });
}

export interface FinancialTotals {
  income: number;
  expense: number;
  net: number;
}

export function calculateTotals(transactions: Transaction[]): FinancialTotals {
  const income = transactions
    .filter((tx) => tx.type === 'in')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const expense = transactions
    .filter((tx) => tx.type === 'out')
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  return {
    income,
    expense,
    net: income - expense,
  };
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' });
}
