import { useNavigate } from 'react-router-dom';
import { useAppState } from '../data/AppStateContext';
import { Scenario } from '../data/types';

const scenarios: { id: Scenario; title: string; description: string; icon: string }[] = [
  {
    id: 'stable',
    title: 'Stabilna firma',
    description: 'Zdrowe finanse, regularne przepływy',
    icon: '📊',
  },
  {
    id: 'liquidity',
    title: 'Problemy z płynnością',
    description: 'Niskie saldo, dużo wydatków',
    icon: '💸',
  },
  {
    id: 'risk',
    title: 'Ryzykowne należności',
    description: 'Dużo faktur do windykacji',
    icon: '⚠️',
  },
  {
    id: 'empty',
    title: 'Pusta firma',
    description: 'Brak danych, świeży start',
    icon: '🆕',
  },
];

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    flex: 1,
  },
  card: {
    background: 'linear-gradient(145deg, #252545 0%, #1e1e3f 100%)',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #333',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    minHeight: '160px',
  },
  icon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '8px',
  },
  cardDesc: {
    fontSize: '12px',
    color: '#888',
    lineHeight: 1.4,
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#666',
  },
};

export function ScenarioSelect() {
  const navigate = useNavigate();
  const { dispatch } = useAppState();

  const handleSelect = (scenario: Scenario) => {
    dispatch({ type: 'SELECT_SCENARIO', scenario });
    navigate('/mobile/app/bank');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Mobile POC</h1>
        <p style={styles.subtitle}>Wybierz scenariusz do przetestowania</p>
      </header>

      <div style={styles.grid}>
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            style={styles.card}
            onClick={() => handleSelect(scenario.id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={styles.icon}>{scenario.icon}</span>
            <h3 style={styles.cardTitle}>{scenario.title}</h3>
            <p style={styles.cardDesc}>{scenario.description}</p>
          </div>
        ))}
      </div>

      <footer style={styles.footer}>
        POC v0.1 • Dane testowe
      </footer>
    </div>
  );
}
