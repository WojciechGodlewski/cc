import { useState } from 'react';
import { useAppState } from '../../data/AppStateContext';
import { Modal } from './Modal';

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
  section: {
    background: '#252545',
    borderRadius: '12px',
    padding: '16px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#888',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  providerCard: {
    background: '#1a1a2e',
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  providerIcon: {
    fontSize: '36px',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '4px',
  },
  providerStatus: {
    fontSize: '12px',
    color: '#888',
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: 600,
  },
  badgeConnected: {
    background: 'rgba(76, 175, 80, 0.2)',
    color: '#4caf50',
  },
  badgeDisconnected: {
    background: 'rgba(255, 193, 7, 0.2)',
    color: '#ffc107',
  },
  button: {
    width: '100%',
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    marginTop: '12px',
  },
  buttonPrimary: {
    background: '#4dabf7',
    color: '#000',
  },
  buttonSecondary: {
    background: '#444',
    color: '#fff',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #444',
    background: '#1a1a2e',
    color: '#fff',
    fontSize: '14px',
    marginBottom: '12px',
    outline: 'none',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    color: '#888',
    marginBottom: '6px',
  },
  syncInfo: {
    marginTop: '16px',
    padding: '14px',
    background: '#1a1a2e',
    borderRadius: '10px',
  },
  syncRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #333',
  },
  syncLabel: {
    fontSize: '13px',
    color: '#888',
  },
  syncValue: {
    fontSize: '13px',
    color: '#fff',
    fontWeight: 500,
  },
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid #444',
    borderTopColor: '#4dabf7',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginRight: '8px',
  },
};

export function AccountingTab() {
  const { state, dispatch } = useAppState();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [isSyncing, setIsSyncing] = useState(false);

  const handleLogin = () => {
    // Mock login - just mark as connected
    if (loginForm.email && loginForm.password) {
      dispatch({ type: 'CONNECT_ACCOUNTING' });
      setShowLoginModal(false);
      setLoginForm({ email: '', password: '' });
    }
  };

  const handleSync = () => {
    setIsSyncing(true);
    // Simulate sync delay
    setTimeout(() => {
      dispatch({ type: 'SYNC_ACCOUNTING' });
      setIsSyncing(false);
    }, 2000);
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Księgowość</h1>
        <p style={styles.subtitle}>Połącz system księgowy</p>
      </header>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>System księgowy</h2>
        <div style={styles.providerCard}>
          <span style={styles.providerIcon}>📚</span>
          <div style={styles.providerInfo}>
            <div style={styles.providerName}>{state.accounting.provider}</div>
            <div style={styles.providerStatus}>
              {state.accounting.connected
                ? 'Konto połączone'
                : 'Konto niepołączone'}
            </div>
          </div>
          <span
            style={{
              ...styles.badge,
              ...(state.accounting.connected
                ? styles.badgeConnected
                : styles.badgeDisconnected),
            }}
          >
            {state.accounting.connected ? 'Aktywne' : 'Nieaktywne'}
          </span>
        </div>

        {!state.accounting.connected ? (
          <button
            style={{ ...styles.button, ...styles.buttonPrimary }}
            onClick={() => setShowLoginModal(true)}
          >
            Zaloguj się do {state.accounting.provider}
          </button>
        ) : (
          <>
            <div style={styles.syncInfo}>
              <div style={styles.syncRow}>
                <span style={styles.syncLabel}>Status</span>
                <span style={{ ...styles.syncValue, color: '#4caf50' }}>
                  Połączono
                </span>
              </div>
              <div style={{ ...styles.syncRow, borderBottom: 'none' }}>
                <span style={styles.syncLabel}>Ostatnia synchronizacja</span>
                <span style={styles.syncValue}>
                  {state.accounting.lastSync
                    ? formatDate(state.accounting.lastSync)
                    : 'Nigdy'}
                </span>
              </div>
            </div>

            <button
              style={{ ...styles.button, ...styles.buttonPrimary }}
              onClick={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <span style={styles.spinner} />
                  Synchronizuję...
                </>
              ) : (
                'Synchronizuj dane'
              )}
            </button>
          </>
        )}
      </section>

      {state.accounting.connected && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Statystyki</h2>
          <div style={styles.syncInfo}>
            <div style={styles.syncRow}>
              <span style={styles.syncLabel}>Faktury w systemie</span>
              <span style={styles.syncValue}>
                {state.ignoredInvoices.length +
                  state.factoringInvoices.length +
                  state.collectionsInvoices.length +
                  state.invoices.length}
              </span>
            </div>
            <div style={styles.syncRow}>
              <span style={styles.syncLabel}>Do faktoringu</span>
              <span style={{ ...styles.syncValue, color: '#4caf50' }}>
                {state.factoringInvoices.length}
              </span>
            </div>
            <div style={{ ...styles.syncRow, borderBottom: 'none' }}>
              <span style={styles.syncLabel}>Do windykacji</span>
              <span style={{ ...styles.syncValue, color: '#f44336' }}>
                {state.collectionsInvoices.length}
              </span>
            </div>
          </div>
        </section>
      )}

      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title={`Logowanie do ${state.accounting.provider}`}
      >
        <div>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            style={styles.input}
            placeholder="jan@firma.pl"
            value={loginForm.email}
            onChange={(e) =>
              setLoginForm((prev) => ({ ...prev, email: e.target.value }))
            }
          />

          <label style={styles.label}>Hasło</label>
          <input
            type="password"
            style={styles.input}
            placeholder="••••••••"
            value={loginForm.password}
            onChange={(e) =>
              setLoginForm((prev) => ({ ...prev, password: e.target.value }))
            }
          />

          <p
            style={{
              fontSize: '11px',
              color: '#888',
              marginBottom: '16px',
              lineHeight: 1.4,
            }}
          >
            To jest POC - wpisz dowolne dane logowania, aby zasymulować
            połączenie.
          </p>

          <button
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              marginTop: 0,
              opacity: loginForm.email && loginForm.password ? 1 : 0.5,
            }}
            onClick={handleLogin}
            disabled={!loginForm.email || !loginForm.password}
          >
            Zaloguj
          </button>

          <button
            style={{
              ...styles.button,
              ...styles.buttonSecondary,
            }}
            onClick={() => setShowLoginModal(false)}
          >
            Anuluj
          </button>
        </div>
      </Modal>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
