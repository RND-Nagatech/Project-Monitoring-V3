import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';

const AppContent: React.FC = () => {
  const { user } = useApp();

  if (!user) {
    return <LoginForm />;
  }

  return <Dashboard />;
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;