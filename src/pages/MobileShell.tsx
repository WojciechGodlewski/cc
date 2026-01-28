import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { BankTab } from '../components/mobile/BankTab';
import { FlowsTab } from '../components/mobile/FlowsTab';
import { InvoicesTab } from '../components/mobile/InvoicesTab';
import { AccountingTab } from '../components/mobile/AccountingTab';

const tabs = [
  { path: 'bank', label: 'Bank', icon: '🏦' },
  { path: 'flows', label: 'Przepływy', icon: '📈' },
  { path: 'invoices', label: 'Faktury', icon: '📄' },
  { path: 'accounting', label: 'Księgowość', icon: '📚' },
];

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#1a1a2e',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '16px',
  },
  nav: {
    display: 'flex',
    borderTop: '1px solid #333',
    background: '#16213e',
    paddingBottom: 'env(safe-area-inset-bottom, 0)',
  },
  tab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 4px',
    textDecoration: 'none',
    color: '#666',
    fontSize: '10px',
    transition: 'color 0.2s',
  },
  tabActive: {
    color: '#4dabf7',
  },
  tabIcon: {
    fontSize: '20px',
    marginBottom: '4px',
  },
};

export function MobileShell() {
  const location = useLocation();

  return (
    <div style={styles.container}>
      <main style={styles.content}>
        <Routes>
          <Route path="bank" element={<BankTab />} />
          <Route path="flows" element={<FlowsTab />} />
          <Route path="invoices" element={<InvoicesTab />} />
          <Route path="accounting" element={<AccountingTab />} />
          <Route path="*" element={<Navigate to="bank" replace />} />
        </Routes>
      </main>

      <nav style={styles.nav}>
        {tabs.map((tab) => {
          const isActive = location.pathname.includes(tab.path);
          return (
            <NavLink
              key={tab.path}
              to={`/mobile/app/${tab.path}`}
              style={{
                ...styles.tab,
                ...(isActive ? styles.tabActive : {}),
              }}
            >
              <span style={styles.tabIcon}>{tab.icon}</span>
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
