import { useState } from 'react';
import { useAppState } from '../../data/AppStateContext';
import { BankProvider } from '../../data/types';
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
  providerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  providerCard: {
    background: '#1a1a2e',
    borderRadius: '10px',
    padding: '16px',
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
  },
  providerCardSelected: {
    borderColor: '#4dabf7',
    background: 'rgba(77, 171, 247, 0.1)',
  },
  providerLogo: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  providerName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
  },
  bankCard: {
    background: '#1a1a2e',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '12px',
  },
  bankHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  bankName: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
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
  badgePending: {
    background: 'rgba(255, 193, 7, 0.2)',
    color: '#ffc107',
  },
  accountNumber: {
    fontSize: '12px',
    color: '#888',
    fontFamily: 'monospace',
    marginBottom: '8px',
  },
  balance: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#4dabf7',
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
    marginTop: '8px',
  },
  buttonPrimary: {
    background: '#4dabf7',
    color: '#000',
  },
  buttonSecondary: {
    background: '#444',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  consentList: {
    marginBottom: '16px',
  },
  consentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 0',
    borderBottom: '1px solid #333',
    fontSize: '13px',
    color: '#ccc',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    accentColor: '#4dabf7',
  },
  empty: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#888',
  },
};

const providers: { id: BankProvider; name: string; logo: string }[] = [
  { id: 'mBank', name: 'mBank', logo: '🏦' },
  { id: 'Santander', name: 'Santander', logo: '🔴' },
];

export function BankTab() {
  const { state, dispatch } = useAppState();
  const [selectedProvider, setSelectedProvider] = useState<BankProvider | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentChecks, setConsentChecks] = useState([false, false, false]);
  const [pendingBankId, setPendingBankId] = useState<string | null>(null);

  const connectedBanks = state.bankConnections.filter(b => b.connected);
  const selectedBank = selectedProvider
    ? state.bankConnections.find(b => b.provider === selectedProvider)
    : null;

  const handleStartConsent = (bankId: string) => {
    setPendingBankId(bankId);
    setConsentChecks([false, false, false]);
    setShowConsentModal(true);
  };

  const handleConsent = () => {
    if (pendingBankId && consentChecks.every(Boolean)) {
      dispatch({ type: 'GIVE_CONSENT', bankId: pendingBankId });
      dispatch({ type: 'CONNECT_BANK', bankId: pendingBankId });
      setShowConsentModal(false);
      setPendingBankId(null);
      setSelectedProvider(null);
    }
  };

  const handleFetchTransactions = (bankId: string) => {
    dispatch({ type: 'FETCH_TRANSACTIONS', bankId });
  };

  if (state.scenario === 'empty') {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>Bank</h1>
          <p style={styles.subtitle}>Połącz swoje konto bankowe</p>
        </header>
        <div style={styles.empty}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>🏦</p>
          <p>Brak danych w scenariuszu "Pusta firma"</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Bank</h1>
        <p style={styles.subtitle}>Połącz swoje konto bankowe</p>
      </header>

      {connectedBanks.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Połączone konta</h2>
          {connectedBanks.map((bank) => (
            <div key={bank.id} style={styles.bankCard}>
              <div style={styles.bankHeader}>
                <span style={styles.bankName}>{bank.provider}</span>
                <span style={{ ...styles.badge, ...styles.badgeConnected }}>Połączono</span>
              </div>
              <div style={styles.accountNumber}>{bank.accountNumber}</div>
              <div style={styles.balance}>
                {bank.balance.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
              </div>
              <button
                style={{ ...styles.button, ...styles.buttonSecondary }}
                onClick={() => handleFetchTransactions(bank.id)}
              >
                Pobierz transakcje
              </button>
            </div>
          ))}
        </section>
      )}

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Dodaj nowe konto</h2>
        <div style={styles.providerGrid}>
          {providers.map((provider) => {
            const bankConnection = state.bankConnections.find(b => b.provider === provider.id);
            const isConnected = bankConnection?.connected;
            const isSelected = selectedProvider === provider.id;

            return (
              <div
                key={provider.id}
                style={{
                  ...styles.providerCard,
                  ...(isSelected ? styles.providerCardSelected : {}),
                  ...(isConnected ? { opacity: 0.5 } : {}),
                }}
                onClick={() => !isConnected && setSelectedProvider(provider.id)}
              >
                <div style={styles.providerLogo}>{provider.logo}</div>
                <div style={styles.providerName}>{provider.name}</div>
                {isConnected && (
                  <div style={{ fontSize: '10px', color: '#4caf50', marginTop: '4px' }}>
                    Połączono
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {selectedBank && !selectedBank.connected && (
          <button
            style={{ ...styles.button, ...styles.buttonPrimary, marginTop: '16px' }}
            onClick={() => handleStartConsent(selectedBank.id)}
          >
            Połącz z {selectedProvider}
          </button>
        )}
      </section>

      <Modal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        title="Zgoda na dostęp"
      >
        <p style={{ color: '#ccc', marginBottom: '16px', fontSize: '13px', lineHeight: 1.5 }}>
          Aby połączyć konto, wyraź zgody na dostęp do danych:
        </p>
        <div style={styles.consentList}>
          {[
            'Dostęp do salda konta',
            'Dostęp do historii transakcji',
            'Przechowywanie danych przez 90 dni',
          ].map((consent, idx) => (
            <label key={idx} style={styles.consentItem}>
              <input
                type="checkbox"
                style={styles.checkbox}
                checked={consentChecks[idx]}
                onChange={(e) => {
                  const newChecks = [...consentChecks];
                  newChecks[idx] = e.target.checked;
                  setConsentChecks(newChecks);
                }}
              />
              {consent}
            </label>
          ))}
        </div>
        <button
          style={{
            ...styles.button,
            ...styles.buttonPrimary,
            ...(consentChecks.every(Boolean) ? {} : styles.buttonDisabled),
          }}
          disabled={!consentChecks.every(Boolean)}
          onClick={handleConsent}
        >
          Wyrażam zgodę
        </button>
      </Modal>
    </div>
  );
}
