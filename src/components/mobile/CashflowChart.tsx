import { useMemo } from 'react';
import { TimeBucket, calculateCumulativeNet } from '../../data/selectors';
import { TypeFilter } from '../../data/types';

interface CashflowChartProps {
  buckets: TimeBucket[];
  typeFilter: TypeFilter;
}

// Net line color - distinct blue/cyan for visibility
const NET_LINE_COLOR = '#4dabf7';

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
  legendLine: {
    width: '12px',
    height: '2px',
    borderRadius: '1px',
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
  // Calculate cumulative net for the line chart
  const bucketsWithNet = useMemo(() => {
    return calculateCumulativeNet(buckets);
  }, [buckets]);

  const { maxBarValue, maxNetAbsolute, normalizedBuckets } = useMemo(() => {
    // Find max value for bar scaling
    let maxBar = 0;
    buckets.forEach((bucket) => {
      if (typeFilter !== 'out') maxBar = Math.max(maxBar, bucket.income);
      if (typeFilter !== 'in') maxBar = Math.max(maxBar, bucket.expense);
    });

    // Find max absolute cumulative net for line scaling
    let maxNet = 0;
    bucketsWithNet.forEach((bucket) => {
      maxNet = Math.max(maxNet, Math.abs(bucket.cumulativeNet));
    });

    // Avoid division by zero
    if (maxBar === 0) maxBar = 1;
    if (maxNet === 0) maxNet = 1;

    // Normalize bucket values to percentages
    const normalized = bucketsWithNet.map((bucket) => ({
      ...bucket,
      incomePercent: (bucket.income / maxBar) * 100,
      expensePercent: (bucket.expense / maxBar) * 100,
      // Net line uses 0-100 scale where 50 is zero, above 50 is positive, below 50 is negative
      netLineY: 50 - (bucket.cumulativeNet / maxNet) * 45, // 45 gives some margin
    }));

    return { maxBarValue: maxBar, maxNetAbsolute: maxNet, normalizedBuckets: normalized };
  }, [buckets, bucketsWithNet, typeFilter]);

  const hasData = buckets.some((b) => b.income > 0 || b.expense > 0);

  const showIncome = typeFilter !== 'out';
  const showExpense = typeFilter !== 'in';

  // Generate SVG path for cumulative net line (smooth curve using quadratic bezier)
  const netLinePath = useMemo(() => {
    if (normalizedBuckets.length === 0) return '';

    const points = normalizedBuckets.map((bucket, idx) => {
      // X position: center of each bucket (percentage across width)
      const x = ((idx + 0.5) / normalizedBuckets.length) * 100;
      // Y position: from netLineY (0 = top, 100 = bottom)
      const y = bucket.netLineY;
      return { x, y };
    });

    // Build smooth path using quadratic bezier curves
    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y}`;
    }

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      // Control point at midpoint for smooth curve
      const cpX = (prev.x + curr.x) / 2;
      path += ` Q ${cpX} ${prev.y}, ${cpX} ${(prev.y + curr.y) / 2}`;
      path += ` Q ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    return path;
  }, [normalizedBuckets]);

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
          <span style={styles.legendItem}>
            <span style={{ ...styles.legendLine, background: NET_LINE_COLOR }} />
            Netto
          </span>
        </div>
      </div>

      {hasData ? (
        <div style={{ ...styles.chartArea, position: 'relative' }}>
          {/* Bar chart layer */}
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

          {/* SVG overlay for cumulative net line */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: 'calc(100% - 20px)', // Exclude label area
              pointerEvents: 'none',
              overflow: 'visible',
            }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Zero line (dashed) */}
            <line
              x1="0"
              y1="50"
              x2="100"
              y2="50"
              stroke="#444"
              strokeWidth="0.5"
              strokeDasharray="2,2"
              vectorEffect="non-scaling-stroke"
            />
            {/* Cumulative net line */}
            <path
              d={netLinePath}
              fill="none"
              stroke={NET_LINE_COLOR}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {/* Data points on the line */}
            {normalizedBuckets.map((bucket, idx) => {
              const x = ((idx + 0.5) / normalizedBuckets.length) * 100;
              return (
                <circle
                  key={idx}
                  cx={x}
                  cy={bucket.netLineY}
                  r="3"
                  fill={NET_LINE_COLOR}
                  vectorEffect="non-scaling-stroke"
                >
                  <title>Netto: {bucket.cumulativeNet.toLocaleString('pl-PL')} PLN</title>
                </circle>
              );
            })}
          </svg>
        </div>
      ) : (
        <div style={styles.emptyState}>Brak danych do wyświetlenia</div>
      )}
    </div>
  );
}
