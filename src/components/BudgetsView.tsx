import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { PiggyBank, Edit3, HelpCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Budget } from '../types/finance';

export const BudgetsView: React.FC = () => {
  const { budgets, updateBudgetLimit, transactions } = useFinance();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempLimit, setTempLimit] = useState('');

  // Handle Edit Limit Action
  const startEditing = (b: Budget) => {
    setEditingCategory(b.category);
    setTempLimit(b.limit.toString());
  };

  const saveLimit = (category: Budget['category']) => {
    const lim = parseFloat(tempLimit);
    if (!isNaN(lim) && lim >= 0) {
      updateBudgetLimit(category, lim);
    }
    setEditingCategory(null);
  };

  // Get percentage spent
  const getPercent = (b: Budget) => {
    if (b.limit === 0) return 0;
    return Math.round((b.spent / b.limit) * 100);
  };

  // Status badges & color styling helper
  const getStatus = (b: Budget) => {
    const pct = getPercent(b);
    if (pct >= 100) return { label: 'Exceeded', class: 'badge-danger', color: 'var(--danger)' };
    if (pct >= 80) return { label: 'Warning', class: 'badge-warning', color: 'var(--warning)' };
    return { label: 'On Track', class: 'badge-success', color: 'var(--success)' };
  };

  const getProgressColor = (b: Budget) => {
    const pct = getPercent(b);
    if (pct >= 100) return 'linear-gradient(90deg, var(--danger) 0%, #ff6b6b 100%)';
    if (pct >= 80) return 'linear-gradient(90deg, var(--warning) 0%, #fcd34d 100%)';
    return 'linear-gradient(90deg, var(--success) 0%, #34d399 100%)';
  };

  return (
    <div className="budgets-view-container animate-fade-in">
      <h1 className="page-title">Monthly Budget Planner</h1>
      <p className="page-subtitle">Set, monitor, and adjust monthly budget limits. BudgetBuddy will notify you when you approach your thresholds.</p>

      <div className="dashboard-grid">
        {/* Main Budget Grid */}
        <div className="col-8 budget-list-col">
          <div className="budget-cards-grid">
            {budgets.map(b => {
              const pct = getPercent(b);
              const status = getStatus(b);
              const isEditing = editingCategory === b.category;

              return (
                <div key={b.category} className="budget-card glass-panel">
                  <div className="budget-card-header">
                    <div className="category-meta">
                      <span className="category-icon bg-info-glow">
                        <PiggyBank size={16} className="text-info" />
                      </span>
                      <span className="category-name">{b.category}</span>
                    </div>
                    <span className={`badge ${status.class}`}>{status.label}</span>
                  </div>

                  <div className="budget-card-body">
                    <div className="budget-progress-info">
                      <div className="progress-spent">
                        <span className="spent-val">${b.spent.toFixed(2)}</span>
                        <span className="spent-label"> spent</span>
                      </div>
                      
                      {isEditing ? (
                        <div className="edit-limit-inline">
                          <input 
                            type="number" 
                            value={tempLimit} 
                            onChange={e => setTempLimit(e.target.value)} 
                            className="edit-limit-input"
                            autoFocus
                          />
                          <button onClick={() => saveLimit(b.category)} className="limit-save-btn">
                            Save
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEditing(b)} className="limit-display" title="Edit Limit">
                          <span>limit: </span>
                          <span className="limit-val">${b.limit}</span>
                          <Edit3 size={11} className="text-dim edit-icon" />
                        </button>
                      )}
                    </div>

                    <div className="budget-progress-track">
                      <div 
                        className="budget-progress-fill" 
                        style={{ 
                          width: `${Math.min(100, pct)}%`,
                          background: getProgressColor(b)
                        }}
                      ></div>
                    </div>

                    <div className="budget-percent-footer">
                      <span>{pct}% of limit used</span>
                      {pct >= 80 && (
                        <span className="warning-text" style={{ color: status.color }}>
                          <AlertTriangle size={11} /> {pct >= 100 ? 'Over limit!' : 'Approaching limit'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Advisor sidebar */}
        <div className="col-4 glass-panel advisor-panel">
          <div className="advisor-header">
            <span className="category-icon bg-success-glow">
              <ShieldCheck size={18} className="text-success" />
            </span>
            <h3 className="section-title">AI Budget Insights</h3>
          </div>

          <div className="advisor-content">
            <div className="advisor-tip">
              <span className="tip-number">01</span>
              <p className="tip-text">Your <strong>Entertainment</strong> budget is at {getPercent(budgets.find(b => b.category === 'Entertainment') || {limit: 1, spent: 0})}% of its limit. Consider holding off on new streaming subscriptions until next month.</p>
            </div>

            <div className="advisor-tip">
              <span className="tip-number">02</span>
              <p className="tip-text">Good job on <strong>Food</strong> spending! You have spent ${budgets.find(b => b.category === 'Food')?.spent} out of ${budgets.find(b => b.category === 'Food')?.limit}. You are currently pacing well under your budget limit.</p>
            </div>

            <div className="advisor-tip">
              <span className="tip-number">03</span>
              <p className="tip-text">Setting limits in <strong>Shopping</strong> could boost your weekly savings by approximately $25. Adjust limits using the edit pencil next to the category label.</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .budgets-view-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .budget-list-col {
          display: flex;
          flex-direction: column;
        }

        .budget-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        @media (max-width: 600px) {
          .budget-cards-grid {
            grid-template-columns: 1fr;
          }
        }

        .budget-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .budget-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .category-meta {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .category-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .category-name {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text-main);
        }

        .budget-card-body {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .budget-progress-info {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .progress-spent {
          display: flex;
          align-items: baseline;
        }

        .spent-val {
          font-size: 1.35rem;
          font-weight: 800;
          color: #fff;
        }

        .spent-label {
          font-size: 0.75rem;
          color: var(--text-dim);
          font-weight: 600;
        }

        .limit-display {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-family: inherit;
          font-size: 0.775rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          transition: var(--transition-smooth);
        }

        .limit-display:hover {
          background: rgba(255,255,255,0.05);
          color: var(--text-main);
        }

        .edit-icon {
          transition: color 0.2s;
        }

        .limit-display:hover .edit-icon {
          color: var(--primary);
        }

        .limit-val {
          font-weight: 700;
          color: var(--text-muted);
        }

        .edit-limit-inline {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .edit-limit-input {
          width: 70px;
          padding: 0.25rem 0.5rem;
          background: rgba(0,0,0,0.3);
          border: 1px solid var(--primary);
          border-radius: 6px;
          color: #fff;
          font-family: inherit;
          font-size: 0.75rem;
          outline: none;
        }

        .limit-save-btn {
          padding: 0.25rem 0.5rem;
          background: var(--primary);
          border: none;
          color: #fff;
          font-family: inherit;
          font-size: 0.7rem;
          font-weight: 700;
          border-radius: 6px;
          cursor: pointer;
        }

        .budget-progress-track {
          height: 8px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 4px;
          overflow: hidden;
        }

        .budget-progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.4s ease-out;
        }

        .budget-percent-footer {
          display: flex;
          justify-content: space-between;
          font-size: 0.725rem;
          color: var(--text-dim);
          font-weight: 600;
        }

        .warning-text {
          display: inline-flex;
          align-items: center;
          gap: 0.15rem;
          font-weight: 700;
        }

        /* Advisor Panel */
        .advisor-panel {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .advisor-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .advisor-content {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .advisor-tip {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .tip-number {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--primary-hover);
          opacity: 0.5;
          font-family: var(--mono);
        }

        .tip-text {
          font-size: 0.8rem;
          line-height: 1.5;
          color: var(--text-muted);
          font-weight: 550;
        }
      `}</style>
    </div>
  );
};
