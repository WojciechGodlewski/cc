import { Routes, Route, Navigate } from 'react-router-dom';
import { ScenarioSelect } from './pages/ScenarioSelect';
import { MobileShell } from './pages/MobileShell';
import { AppStateProvider } from './data/AppStateContext';

export default function App() {
  return (
    <AppStateProvider>
      <Routes>
        <Route path="/mobile" element={<ScenarioSelect />} />
        <Route path="/mobile/app/*" element={<MobileShell />} />
        <Route path="*" element={<Navigate to="/mobile" replace />} />
      </Routes>
    </AppStateProvider>
  );
}
