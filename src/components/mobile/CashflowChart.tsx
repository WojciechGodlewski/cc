import { useMemo } from 'react';
import { TimeBucket } from '../../data/selectors';
import { TypeFilter } from '../../data/types';

interface CashflowChartProps {
  buckets: TimeBucket[];
  typeFilter: TypeFilter;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: '#252545',
    borderRadius: '12px',
    padding: '14px',
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
  legend: {
    display: 'flex',
    gap: '12px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    color: '#888',
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '2px',
  },
  chartArea: {
    position: 'relative',
    height: '120px',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '4px',
    paddingBottom: '20px',
  },
  barGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    minWidth: 0,
  },
  barsContainer: {
    display: 'flex',
    gap: '2px',
    alignItems: 'flex-end',
    height: 'calc(100% - 16px)',
    width: '100%',
    justifyContent: 'center',
  },
  bar: {
    flex: 1,
    maxWidth: '12px',
    borderRadius: '2px 2px 0 0',
    minHeight: '2px',
    transition: 'height 0.3s ease',
  },
  barIncome: {
    background: '#4caf50',
  },
  barExpense: {
    background: '#f44336',
  },
  label: {
    fontSize: '8px',
    color: '#666',
    marginTop: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
    textAlign: 'center',
  },
  emptyState: {
    height: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    fontSize: '12px',
  },
};

export function CashflowChart({ buckets, typeFilter }: CashflowChartProps) {
  const { maxValue, normalizedBuckets } = useMemo(() => {
    // Find max value for scaling
    let max = 0;
    buckets.forEach((bucket) => {
      if (typeFilter !== 'out') max = Math.max(max, bucket.income);
      if (typeFilter !== 'in') max = Math.max(max, bucket.expense);
    });

    // Avoid division by zero
    if (max === 0) max = 1;

    // Normalize bucket values to percentages
    const normalized = buckets.map((bucket) => ({
      ...bucket,
      incomePercent: (bucket.income / max) * 100,
      expensePercent: (bucket.expense / max) * 100,
    }));

    return { maxValue: max, normalizedBuckets: normalized };
  }, [buckets, typeFilter]);

  const hasData = buckets.some((b) => b.income > 0 || b.expense > 0);

  const showIncome = typeFilter !== 'out';
  const showExpense = typeFilter !== 'in';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Wykres przepływów</span>
        <div style={styles.legend}>
          {showIncome && (
            <span style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: '#4caf50' }} />
              Przychody
            </span>
          )}
          {showExpense && (
            <span style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: '#f44336' }} />
              Wydatki
            </span>
          )}
        </div>
      </div>

      {hasData ? (
        <div style={styles.chartArea}>
          {normalizedBuckets.map((bucket, idx) => (
            <div key={idx} style={styles.barGroup}>
              <div style={styles.barsContainer}>
                {showIncome && (
                  <div
                    style={{
                      ...styles.bar,
                      ...styles.barIncome,
                      height: `${Math.max(bucket.incomePercent, bucket.income > 0 ? 5 : 0)}%`,
                    }}
                    title={`Przychody: ${bucket.income.toLocaleString('pl-PL')} PLN`}
                  />
                )}
                {showExpense && (
                  <div
                    style={{
                      ...styles.bar,
                      ...styles.barExpense,
                      height: `${Math.max(bucket.expensePercent, bucket.expense > 0 ? 5 : 0)}%`,
                    }}
                    title={`Wydatki: ${bucket.expense.toLocaleString('pl-PL')} PLN`}
                  />
                )}
              </div>
              <span style={styles.label}>{bucket.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>Brak danych do wyświetlenia</div>
      )}
    </div>
  );
}
