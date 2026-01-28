import { useMemo } from 'react';
import { useAppState } from '../../data/AppStateContext';
import { filterTransactions, calculateTotals, formatCurrency } from '../../data/selectors';

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'linear-gradient(135deg, #252545 0%, #1e1e3f 100%)',
    borderRadius: '12px',
    padding: '14px',
    marginBottom: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  title: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  periodBadge: {
    fontSize: '10px',
    padding: '3px 8px',
    borderRadius: '10px',
    background: 'rgba(77, 171, 247, 0.2)',
    color: '#4dabf7',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
  },
  metric: {
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: '10px',
    color: '#888',
    marginBottom: '4px',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: '14px',
    fontWeight: 700,
    minHeight: '20px',
  },
  income: {
    color: '#4caf50',
  },
  expense: {
    color: '#f44336',
  },
  netPositive: {
    color: '#4caf50',
  },
  netNegative: {
    color: '#f44336',
  },
  empty: {
    textAlign: 'center',
    padding: '8px',
    color: '#666',
    fontSize: '12px',
  },
};

export function FinancialDashboard() {
  const { state } = useAppState();
  const { period, typeFilter } = state.dashboardFilters;

  const totals = useMemo(() => {
    const filtered = filterTransactions(state.transactions, period, typeFilter);
    return calculateTotals(filtered);
  }, [state.transactions, period, typeFilter]);

  const hasTransactions = state.transactions.length > 0;

  const periodLabel = `${period} dni`;
  const typeLabel = typeFilter === 'all' ? '' : typeFilter === 'in' ? ' (przychody)' : ' (wydatki)';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Podsumowanie</span>
        <span style={styles.periodBadge}>{periodLabel}{typeLabel}</span>
      </div>

      {hasTransactions ? (
        <div style={styles.grid}>
          <div style={styles.metric}>
            <div style={styles.metricLabel}>Przychody</div>
            <div style={{ ...styles.metricValue, ...styles.income }}>
              {formatCurrency(totals.income)}
            </div>
          </div>
          <div style={styles.metric}>
            <div style={styles.metricLabel}>Wydatki</div>
            <div style={{ ...styles.metricValue, ...styles.expense }}>
              {formatCurrency(totals.expense)}
            </div>
          </div>
          <div style={styles.metric}>
            <div style={styles.metricLabel}>Netto</div>
            <div
              style={{
                ...styles.metricValue,
                ...(totals.net >= 0 ? styles.netPositive : styles.netNegative),
              }}
            >
              {formatCurrency(totals.net)}
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.empty}>
          Brak danych finansowych
        </div>
      )}
    </div>
  );
}
