import { Transaction, PeriodFilter, TypeFilter, InvoiceDecision } from './types';

// Mock "today" date - consistent with FlowsTab
export const MOCK_TODAY = new Date('2024-01-15');

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

export interface TimeBucket {
  label: string;
  startDate: Date;
  endDate: Date;
  income: number;
  expense: number;
}

function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.floor(diff / oneWeek);
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
}

function formatWeekLabel(startDate: Date): string {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  return `${formatDayLabel(startDate)}`;
}

export function bucketTransactionsByTime(
  transactions: Transaction[],
  period: PeriodFilter
): TimeBucket[] {
  const buckets: Map<string, TimeBucket> = new Map();
  const useDaily = period === 7;

  // Generate all buckets for the period (even empty ones)
  const cutoff = new Date(MOCK_TODAY);
  cutoff.setDate(cutoff.getDate() - period);

  if (useDaily) {
    // Daily buckets for 7 days
    for (let i = 0; i < period; i++) {
      const date = new Date(cutoff);
      date.setDate(date.getDate() + i);
      const key = date.toISOString().split('T')[0];
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      buckets.set(key, {
        label: formatDayLabel(date),
        startDate: new Date(date),
        endDate,
        income: 0,
        expense: 0,
      });
    }
  } else {
    // Weekly buckets for 30/90 days
    const numWeeks = Math.ceil(period / 7);
    for (let i = 0; i < numWeeks; i++) {
      const weekStart = new Date(cutoff);
      weekStart.setDate(weekStart.getDate() + i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      if (weekStart > MOCK_TODAY) break;

      const key = `w${i}`;
      buckets.set(key, {
        label: formatWeekLabel(weekStart),
        startDate: weekStart,
        endDate: weekEnd,
        income: 0,
        expense: 0,
      });
    }
  }

  // Aggregate transactions into buckets
  transactions.forEach((tx) => {
    const txDate = new Date(tx.date);

    if (useDaily) {
      const key = tx.date;
      const bucket = buckets.get(key);
      if (bucket) {
        if (tx.type === 'in') {
          bucket.income += tx.amount;
        } else {
          bucket.expense += Math.abs(tx.amount);
        }
      }
    } else {
      // Find the right week bucket
      for (const [key, bucket] of buckets.entries()) {
        if (txDate >= bucket.startDate && txDate <= bucket.endDate) {
          if (tx.type === 'in') {
            bucket.income += tx.amount;
          } else {
            bucket.expense += Math.abs(tx.amount);
          }
          break;
        }
      }
    }
  });

  return Array.from(buckets.values());
}

// ============================================================================
// Invoice Decision -> Synthetic Cashflow Logic
// ============================================================================

// Factoring: immediate inflow at 97% of invoice amount
const FACTORING_RATE = 0.97;

// Collections: inflow 14 days later at 70% of invoice amount
const COLLECTIONS_RATE = 0.70;
const COLLECTIONS_DELAY_DAYS = 14;

/**
 * Generate synthetic transactions from invoice decisions.
 *
 * Decision logic:
 * - Factoring: Add inflow on decision date, amount = invoice.amount * 0.97
 * - Collections: Add inflow 14 days after decision, amount = invoice.amount * 0.70
 * - Ignore: No cashflow effect
 */
export function generateSyntheticTransactions(
  decisions: InvoiceDecision[]
): Transaction[] {
  const syntheticTx: Transaction[] = [];

  decisions.forEach((decision) => {
    if (decision.decision === 'ignore') {
      // No financial impact for ignored invoices
      return;
    }

    if (decision.decision === 'factoring') {
      // Factoring: immediate inflow at 97%
      const amount = Math.round(decision.invoice.amount * FACTORING_RATE * 100) / 100;
      syntheticTx.push({
        id: `synthetic-factoring-${decision.invoiceId}`,
        date: decision.decisionTimestamp,
        description: `Faktoring: ${decision.invoice.number} (${decision.invoice.contractor})`,
        amount,
        type: 'in',
        category: 'Faktoring',
        bankId: 'synthetic',
      });
    } else if (decision.decision === 'collections') {
      // Collections: inflow 14 days later at 70%
      const decisionDate = new Date(decision.decisionTimestamp);
      decisionDate.setDate(decisionDate.getDate() + COLLECTIONS_DELAY_DAYS);
      const paymentDate = decisionDate.toISOString().split('T')[0];

      const amount = Math.round(decision.invoice.amount * COLLECTIONS_RATE * 100) / 100;
      syntheticTx.push({
        id: `synthetic-collections-${decision.invoiceId}`,
        date: paymentDate,
        description: `Windykacja: ${decision.invoice.number} (${decision.invoice.contractor})`,
        amount,
        type: 'in',
        category: 'Windykacja',
        bankId: 'synthetic',
      });
    }
  });

  return syntheticTx;
}

/**
 * Combine real transactions with synthetic transactions from invoice decisions.
 * This is the primary selector for dashboard and flows chart.
 */
export function combineTransactions(
  realTransactions: Transaction[],
  invoiceDecisions: InvoiceDecision[]
): Transaction[] {
  const syntheticTx = generateSyntheticTransactions(invoiceDecisions);
  return [...realTransactions, ...syntheticTx].sort((a, b) => a.date.localeCompare(b.date));
}
