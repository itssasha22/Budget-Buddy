import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  LayoutDashboard, 
  Receipt, 
  PiggyBank, 
  CalendarClock, 
  Sparkles, 
  RotateCcw,
  ShieldCheck
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, resetAll, healthScore } = useFinance();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budgets', label: 'Budget Planner', icon: PiggyBank },
    { id: 'bills', label: 'Bills & Subs', icon: CalendarClock },
    { id: 'savings', label: 'Savings Goals', icon: ShieldCheck },
    { id: 'insights', label: 'AI Insights', icon: Sparkles }
  ];

  return (
    <aside className="sidebar-container glass-panel">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <PiggyBank size={28} className="logo-icon" />
          <span>BudgetBuddy</span>
        </div>
        <p className="brand-tagline">Spend smarter. Save effortlessly.</p>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`menu-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mini financial health summary widget at the bottom of sidebar */}
      <div className="sidebar-footer-widget">
        <div className="footer-score">
          <div className="score-details">
            <span className="score-label">Health Score</span>
            <span className="score-value">{healthScore.score}/100</span>
          </div>
          <div className="score-progress-bar">
            <div 
              className={`score-progress-fill ${
                healthScore.score >= 80 ? 'bg-success' : healthScore.score >= 65 ? 'bg-info' : 'bg-warning'
              }`}
              style={{ width: `${healthScore.score}%` }}
            ></div>
          </div>
        </div>

        <button onClick={resetAll} className="reset-btn">
          <RotateCcw size={14} />
          <span>Reset Demo Data</span>
        </button>
      </div>

      <style>{`
        .sidebar-container {
          width: 260px;
          min-height: calc(100vh - 2rem);
          margin: 1rem;
          display: flex;
          flex-direction: column;
          border-radius: 20px;
          padding: 1.75rem 1.25rem;
          flex-shrink: 0;
          background: rgba(13, 14, 21, 0.85);
        }

        @media (max-width: 1024px) {
          .sidebar-container {
            width: calc(100% - 2rem);
            min-height: auto;
            margin: 1rem;
            padding: 1.25rem;
          }
        }

        .sidebar-brand {
          margin-bottom: 2rem;
          padding: 0 0.5rem;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #fff 40%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .logo-icon {
          color: var(--primary);
        }

        .brand-tagline {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.35rem;
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .sidebar-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        @media (max-width: 1024px) {
          .sidebar-menu {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1rem;
          }
        }

        .menu-btn {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 0.875rem 1rem;
          border-radius: 12px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-family: inherit;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-smooth);
          text-align: left;
        }

        .menu-btn:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.03);
          transform: translateX(4px);
        }

        @media (max-width: 1024px) {
          .menu-btn:hover {
            transform: none;
          }
        }

        .menu-btn.active {
          color: #fff;
          background: var(--primary);
          box-shadow: 0 4px 15px 0 rgba(139, 92, 246, 0.3);
        }

        .sidebar-footer-widget {
          margin-top: 2rem;
          padding-top: 1.25rem;
          border-top: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .footer-score {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .score-details {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .score-label {
          color: var(--text-muted);
        }

        .score-value {
          color: var(--text-main);
        }

        .score-progress-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
          overflow: hidden;
        }

        .score-progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease-out;
        }

        .bg-success {
          background-color: var(--success) !important;
        }

        .bg-info {
          background-color: var(--info) !important;
        }

        .bg-warning {
          background-color: var(--warning) !important;
        }

        .reset-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.625rem;
          border-radius: 10px;
          background: rgba(239, 68, 68, 0.08);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.15);
          font-family: inherit;
          font-size: 0.775rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .reset-btn:hover {
          background: rgba(239, 68, 68, 0.18);
          border-color: rgba(239, 68, 68, 0.3);
        }
      `}</style>
    </aside>
  );
};
