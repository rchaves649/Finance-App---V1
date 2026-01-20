
import React, { useState } from 'react';
import { ScopeProvider } from './shared/ScopeContext';
import { PeriodProvider } from './shared/PeriodContext';
import { Layout } from './shared/Layout';
import { ViewType } from './types/finance';
import { DashboardContainer } from './dashboard/DashboardContainer';
import { TransactionsContainer } from './transactions/TransactionsContainer';
import { SettingsContainer } from './settings/SettingsContainer';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardContainer />;
      case 'transactions': return <TransactionsContainer />;
      case 'settings': return <SettingsContainer />;
      default: return <DashboardContainer />;
    }
  };

  return (
    <ScopeProvider>
      <PeriodProvider>
        <Layout activeView={activeView} onViewChange={setActiveView}>
          {renderContent()}
        </Layout>
      </PeriodProvider>
    </ScopeProvider>
  );
};

export default App;
