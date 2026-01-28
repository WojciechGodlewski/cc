import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, initialAppState, STORAGE_KEY, Scenario, BankProvider, Invoice } from './types';
import { generateMockData } from './mockData';

type Action =
  | { type: 'SELECT_SCENARIO'; scenario: Scenario }
  | { type: 'GIVE_CONSENT'; bankId: string }
  | { type: 'CONNECT_BANK'; bankId: string }
  | { type: 'FETCH_TRANSACTIONS'; bankId: string }
  | { type: 'SWIPE_INVOICE'; invoiceId: string; direction: 'left' | 'up' | 'down' }
  | { type: 'UNDO_INVOICE' }
  | { type: 'CONNECT_ACCOUNTING' }
  | { type: 'SYNC_ACCOUNTING' }
  | { type: 'RESET' };

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return initialAppState;
}

function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SELECT_SCENARIO': {
      return generateMockData(action.scenario);
    }

    case 'GIVE_CONSENT': {
      return {
        ...state,
        bankConnections: state.bankConnections.map(bank =>
          bank.id === action.bankId ? { ...bank, consentGiven: true } : bank
        ),
      };
    }

    case 'CONNECT_BANK': {
      return {
        ...state,
        bankConnections: state.bankConnections.map(bank =>
          bank.id === action.bankId ? { ...bank, connected: true } : bank
        ),
      };
    }

    case 'FETCH_TRANSACTIONS': {
      // Transactions are already generated, just mark as fetched
      return state;
    }

    case 'SWIPE_INVOICE': {
      const invoice = state.invoices.find(inv => inv.id === action.invoiceId);
      if (!invoice) return state;

      const newStatus: Invoice['status'] =
        action.direction === 'left' ? 'ignored' :
        action.direction === 'up' ? 'factoring' : 'collections';

      const updatedInvoice = { ...invoice, status: newStatus };

      return {
        ...state,
        invoices: state.invoices.filter(inv => inv.id !== action.invoiceId),
        ignoredInvoices: newStatus === 'ignored'
          ? [...state.ignoredInvoices, updatedInvoice]
          : state.ignoredInvoices,
        factoringInvoices: newStatus === 'factoring'
          ? [...state.factoringInvoices, updatedInvoice]
          : state.factoringInvoices,
        collectionsInvoices: newStatus === 'collections'
          ? [...state.collectionsInvoices, updatedInvoice]
          : state.collectionsInvoices,
        undoStack: [...state.undoStack, { invoice, fromStatus: 'pending' }],
      };
    }

    case 'UNDO_INVOICE': {
      if (state.undoStack.length === 0) return state;

      const lastAction = state.undoStack[state.undoStack.length - 1];
      const restoredInvoice = { ...lastAction.invoice, status: 'pending' as const };

      return {
        ...state,
        invoices: [...state.invoices, restoredInvoice].sort((a, b) =>
          a.dueDate.localeCompare(b.dueDate)
        ),
        ignoredInvoices: state.ignoredInvoices.filter(inv => inv.id !== lastAction.invoice.id),
        factoringInvoices: state.factoringInvoices.filter(inv => inv.id !== lastAction.invoice.id),
        collectionsInvoices: state.collectionsInvoices.filter(inv => inv.id !== lastAction.invoice.id),
        undoStack: state.undoStack.slice(0, -1),
      };
    }

    case 'CONNECT_ACCOUNTING': {
      return {
        ...state,
        accounting: { ...state.accounting, connected: true },
      };
    }

    case 'SYNC_ACCOUNTING': {
      return {
        ...state,
        accounting: {
          ...state.accounting,
          lastSync: new Date().toISOString(),
        },
      };
    }

    case 'RESET': {
      return initialAppState;
    }

    default:
      return state;
  }
}

interface AppStateContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppStateContext = createContext<AppStateContextType | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, null, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}
