import { Scenario, BankConnection, Transaction, Invoice, AppState, initialAppState } from './types';

// Deterministic random based on seed
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

function generateTransactions(
  rand: () => number,
  bankId: string,
  count: number,
  bias: 'balanced' | 'more_out' | 'more_in'
): Transaction[] {
  const categories = ['Sprzedaż', 'Usługi', 'Wynagrodzenia', 'Materiały', 'Media', 'Transport', 'Marketing', 'IT'];
  const contractors = ['ABC Sp. z o.o.', 'XYZ S.A.', 'Jan Kowalski', 'Firma Handlowa', 'TechCorp', 'SupplyChain Ltd'];

  const transactions: Transaction[] = [];
  const baseDate = new Date('2024-01-15');

  for (let i = 0; i < count; i++) {
    const isIncome = bias === 'more_in' ? rand() > 0.3 : bias === 'more_out' ? rand() > 0.7 : rand() > 0.5;
    const daysAgo = Math.floor(rand() * 90);
    const date = new Date(baseDate);
    date.setDate(date.getDate() - daysAgo);

    transactions.push({
      id: `tx-${bankId}-${i}`,
      date: date.toISOString().split('T')[0],
      description: `${isIncome ? 'Wpłata' : 'Wypłata'} - ${contractors[Math.floor(rand() * contractors.length)]}`,
      amount: Math.round((rand() * 9000 + 1000) * 100) / 100 * (isIncome ? 1 : -1),
      type: isIncome ? 'in' : 'out',
      category: categories[Math.floor(rand() * categories.length)],
      bankId,
    });
  }

  return transactions.sort((a, b) => b.date.localeCompare(a.date));
}

function generateInvoices(rand: () => number, count: number): Invoice[] {
  const contractors = [
    'ABC Sp. z o.o.', 'XYZ S.A.', 'Firma Handlowa Nowak',
    'TechCorp Polska', 'SupplyChain Sp. z o.o.', 'Marketing Plus',
    'IT Solutions', 'Transport Kowalski', 'Hurtownia Centrum'
  ];

  const invoices: Invoice[] = [];
  const baseDate = new Date('2024-01-15');

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(rand() * 60);
    const issuedDate = new Date(baseDate);
    issuedDate.setDate(issuedDate.getDate() - daysAgo);

    const dueDate = new Date(issuedDate);
    dueDate.setDate(dueDate.getDate() + Math.floor(rand() * 30) + 14);

    invoices.push({
      id: `inv-${i}`,
      number: `FV/${2024}/${String(i + 1).padStart(4, '0')}`,
      contractor: contractors[Math.floor(rand() * contractors.length)],
      amount: Math.round((rand() * 15000 + 500) * 100) / 100,
      issuedDate: issuedDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'pending',
    });
  }

  return invoices.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function generateMockData(scenario: Scenario): AppState {
  if (scenario === 'empty') {
    return {
      ...initialAppState,
      scenario,
    };
  }

  const seedMap: Record<Exclude<Scenario, 'empty'>, number> = {
    stable: 12345,
    liquidity: 67890,
    risk: 11111,
  };

  const rand = seededRandom(seedMap[scenario]);

  const bankConnections: BankConnection[] = [
    {
      id: 'bank-1',
      provider: 'mBank',
      accountNumber: 'PL61 1090 1014 0000 0712 1981 2874',
      balance: scenario === 'stable' ? 125000 : scenario === 'liquidity' ? 8500 : 45000,
      connected: false,
      consentGiven: false,
    },
    {
      id: 'bank-2',
      provider: 'Santander',
      accountNumber: 'PL27 1090 1014 0000 0001 2300 1234',
      balance: scenario === 'stable' ? 78000 : scenario === 'liquidity' ? 2100 : 15000,
      connected: false,
      consentGiven: false,
    },
  ];

  const transactionBias = scenario === 'stable' ? 'balanced' : scenario === 'liquidity' ? 'more_out' : 'more_in';
  const transactionCount = scenario === 'stable' ? 50 : scenario === 'liquidity' ? 80 : 35;

  const transactions = [
    ...generateTransactions(rand, 'bank-1', Math.floor(transactionCount * 0.6), transactionBias),
    ...generateTransactions(rand, 'bank-2', Math.floor(transactionCount * 0.4), transactionBias),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const invoiceCount = scenario === 'stable' ? 8 : scenario === 'liquidity' ? 15 : 25;
  const invoices = generateInvoices(rand, invoiceCount);

  return {
    ...initialAppState,
    scenario,
    bankConnections,
    transactions,
    invoices,
  };
}
