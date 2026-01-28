import { useMemo } from 'react';
import { useAppState } from '../../data/AppStateContext';
import { filterTransactions, calculateTotals, formatCurrency } from '../../data/selectors';
import { PeriodFilter, TypeFilter } from '../../data/types';

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  header: {
    marginBottom: '8px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#888',
  },
  totalsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  totalCard: {
    background: '#252545',
    borderRadius: '12px',
    padding: '14px',
    textAlign: 'center',
  },
  totalLabel: {
    fontSize: '11px',
    color: '#888',
    marginBottom: '4px',
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: '16px',
    fontWeight: 700,
  },
  totalIncome: {
    color: '#4caf50',
  },
  totalExpense: {
    color: '#f44336',
  },
  totalNet: {
    color: '#4dabf7',
  },
  filtersSection: {
    background: '#252545',
    borderRadius: '12px',
    padding: '14px',
  },
  filterRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  },
  filterLabel: {
    fontSize: '12px',
    color: '#888',
    marginBottom: '8px',
  },
  filterButton: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: '#1a1a2e',
    color: '#888',
  },
  filterButtonActive: {
    background: '#4dabf7',
    color: '#000',
  },
  listSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#888',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  transactionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  transactionCard: {
    background: '#252545',
    borderRadius: '10px',
    padding: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    minWidth: 0,
  },
  transactionDesc: {
    fontSize: '14px',
    color: '#fff',
    marginBottom: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  transactionMeta: {
    fontSize: '12px',
    color: '#888',
  },
  transactionAmount: {
    fontSize: '16px',
    fontWeight: 600,
    marginLeft: '12px',
  },
  empty: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#888',
  },
};

export function FlowsTab() {
  const { state, dispatch } = useAppState();
  const { period, typeFilter } = state.dashboardFilters;

  const setPeriod = (p: PeriodFilter) => dispatch({ type: 'SET_PERIOD_FILTER', period: p });
  const setTypeFilter = (t: TypeFilter) => dispatch({ type: 'SET_TYPE_FILTER', typeFilter: t });

  const filteredTransactions = useMemo(() => {
    return filterTransactions(state.transactions, period, typeFilter);
  }, [state.transactions, period, typeFilter]);

  const totals = useMemo(() => {
    return calculateTotals(filteredTransactions);
  }, [filteredTransactions]);

  if (state.transactions.length === 0) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>Przepływy</h1>
          <p style={styles.subtitle}>Analiza przepływów pieniężnych</p>
        </header>
        <div style={styles.empty}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>📈</p>
          <p>Brak transakcji do wyświetlenia</p>
          <p style={{ fontSize: '12px', marginTop: '8px' }}>
            Połącz konto bankowe, aby zobaczyć przepływy
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Przepływy</h1>
        <p style={styles.subtitle}>Analiza przepływów pieniężnych</p>
      </header>

      <div style={styles.totalsGrid}>
        <div style={styles.totalCard}>
          <div style={styles.totalLabel}>Przychody</div>
          <div style={{ ...styles.totalValue, ...styles.totalIncome }}>
            {formatCurrency(totals.income)}
          </div>
        </div>
        <div style={styles.totalCard}>
          <div style={styles.totalLabel}>Wydatki</div>
          <div style={{ ...styles.totalValue, ...styles.totalExpense }}>
            {formatCurrency(totals.expense)}
          </div>
        </div>
        <div style={styles.totalCard}>
          <div style={styles.totalLabel}>Netto</div>
          <div
            style={{
              ...styles.totalValue,
              color: totals.net >= 0 ? '#4caf50' : '#f44336',
            }}
          >
            {formatCurrency(totals.net)}
          </div>
        </div>
      </div>

      <div style={styles.filtersSection}>
        <div style={styles.filterLabel}>Okres</div>
        <div style={styles.filterRow}>
          {([7, 30, 90] as PeriodFilter[]).map((p) => (
            <button
              key={p}
              style={{
                ...styles.filterButton,
                ...(period === p ? styles.filterButtonActive : {}),
              }}
              onClick={() => setPeriod(p)}
            >
              {p} dni
            </button>
          ))}
        </div>

        <div style={styles.filterLabel}>Typ</div>
        <div style={styles.filterRow}>
          {[
            { id: 'all', label: 'Wszystkie' },
            { id: 'in', label: 'Przychody' },
            { id: 'out', label: 'Wydatki' },
          ].map((t) => (
            <button
              key={t.id}
              style={{
                ...styles.filterButton,
                ...(typeFilter === t.id ? styles.filterButtonActive : {}),
              }}
              onClick={() => setTypeFilter(t.id as TypeFilter)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.listSection}>
        <h2 style={styles.sectionTitle}>
          Transakcje ({filteredTransactions.length})
        </h2>
        <div style={styles.transactionList}>
          {filteredTransactions.slice(0, 20).map((tx) => (
            <div key={tx.id} style={styles.transactionCard}>
              <div style={styles.transactionInfo}>
                <div style={styles.transactionDesc}>{tx.description}</div>
                <div style={styles.transactionMeta}>
                  {tx.date} • {tx.category}
                </div>
              </div>
              <div
                style={{
                  ...styles.transactionAmount,
                  color: tx.type === 'in' ? '#4caf50' : '#f44336',
                }}
              >
                {tx.type === 'in' ? '+' : ''}{formatCurrency(tx.amount)}
              </div>
            </div>
          ))}
          {filteredTransactions.length > 20 && (
            <div style={{ textAlign: 'center', padding: '12px', color: '#888', fontSize: '13px' }}>
              +{filteredTransactions.length - 20} więcej transakcji
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
