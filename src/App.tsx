import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar } from './components/Sidebar';
import { NotificationCenter } from './components/NotificationCenter';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { BudgetsView } from './components/BudgetsView';
import { BillsSubscriptionsView } from './components/BillsSubscriptionsView';
import { SavingsView } from './components/SavingsView';
import { InsightsView } from './components/InsightsView';
import './App.css';

const FinanceAppContent: React.FC = () => {
  const { activeView } = useFinance();

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'transactions':
        return <TransactionsView />;
      case 'budgets':
        return <BudgetsView />;
      case 'bills':
        return <BillsSubscriptionsView />;
      case 'savings':
        return <SavingsView />;
      case 'insights':
        return <InsightsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <NotificationCenter />
        {renderActiveView()}
      </main>
    </div>
  );
};

function App() {
  return (
    <FinanceProvider>
      <FinanceAppContent />
    </FinanceProvider>
  );
}

export default App;
