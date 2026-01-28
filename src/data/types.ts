export type Scenario = 'stable' | 'liquidity' | 'risk' | 'empty';

export type BankProvider = 'mBank' | 'Santander';

export interface BankConnection {
  id: string;
  provider: BankProvider;
  accountNumber: string;
  balance: number;
  connected: boolean;
  consentGiven: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'in' | 'out';
  category: string;
  bankId: string;
}

export interface Invoice {
  id: string;
  number: string;
  contractor: string;
  amount: number;
  dueDate: string;
  issuedDate: string;
  status: 'pending' | 'ignored' | 'factoring' | 'collections';
}

export interface AccountingConnection {
  provider: string;
  connected: boolean;
  lastSync: string | null;
}

export interface AppState {
  scenario: Scenario | null;
  bankConnections: BankConnection[];
  transactions: Transaction[];
  invoices: Invoice[];
  ignoredInvoices: Invoice[];
  factoringInvoices: Invoice[];
  collectionsInvoices: Invoice[];
  undoStack: { invoice: Invoice; fromStatus: Invoice['status'] }[];
  accounting: AccountingConnection;
}

export const STORAGE_KEY = 'poc.mobile.state';

export const initialAppState: AppState = {
  scenario: null,
  bankConnections: [],
  transactions: [],
  invoices: [],
  ignoredInvoices: [],
  factoringInvoices: [],
  collectionsInvoices: [],
  undoStack: [],
  accounting: {
    provider: 'wFirma',
    connected: false,
    lastSync: null,
  },
};
