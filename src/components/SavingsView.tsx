import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Target, Calendar, Sparkles, Plus, Landmark, ArrowUpRight } from 'lucide-react';
import { SavingsGoal } from '../types/finance';

export const SavingsView: React.FC = () => {
  const { savingsGoals, addSavingsGoal, updateSavingsProgress } = useFinance();

  // Create Goal form states
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');

  // Add funds wizard states
  const [activeContributionId, setActiveContributionId] = useState<string | null>(null);
  const [contributionAmt, setContributionAmt] = useState('');

  // Handle Form Submit
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !goalTarget || !goalDeadline) return;
    addSavingsGoal(goalName, parseFloat(goalTarget), goalDeadline);
    setGoalName('');
    setGoalTarget('');
    setGoalDeadline('');
  };

  // Handle Allocation Submit
  const handleAllocate = (goalId: string) => {
    const amt = parseFloat(contributionAmt);
    if (!isNaN(amt) && amt > 0) {
      updateSavingsProgress(goalId, amt);
    }
    setActiveContributionId(null);
    setContributionAmt('');
  };

  return (
    <div className="savings-view-container animate-fade-in">
      <h1 className="page-title">Savings Goals</h1>
      <p className="page-subtitle">Track your savings targets. BudgetBuddy AI calculates weekly savings recommendations based on deadlines.</p>

      <div className="dashboard-grid">
        {/* Savings Card List */}
        <div className="col-8 goals-list-col">
          <div className="goals-grid">
            {savingsGoals.map(goal => {
              const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              const isAllocating = activeContributionId === goal.id;

              return (
                <div key={goal.id} className="goal-card glass-panel">
                  <div className="goal-card-header">
                    <div className="goal-icon-title">
                      <span className="goal-icon bg-success-glow">
                        <Target size={16} className="text-success" />
                      </span>
                      <div>
                        <h4 className="goal-name-text">{goal.name}</h4>
                        <span className="goal-deadline-label">
                          <Calendar size={10} /> Deadline: {goal.deadline}
                        </span>
                      </div>
                    </div>
                    <span className="goal-percent-badge">{percent}%</span>
                  </div>

                  <div className="goal-card-body">
                    <div className="goal-progress-bar">
                      <div className="goal-progress-fill" style={{ width: `${percent}%` }}></div>
                    </div>

                    <div className="goal-values-row">
                      <div className="goal-val-group">
                        <span className="val-lbl">Current</span>
                        <span className="val-number font-semibold">${goal.currentAmount.toLocaleString()}</span>
                      </div>
                      <div className="goal-val-group text-right">
                        <span className="val-lbl">Target</span>
                        <span className="val-number font-semibold">${goal.targetAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* AI Recommendation Alert Box */}
                    {percent < 100 && (
                      <div className="ai-recommendation-box">
                        <Sparkles size={14} className="text-primary-hover spark-icon" />
                        <span className="recommendation-text">
                          AI recommends saving <strong>${goal.recommendedWeeklySavings.toFixed(2)}</strong>/week to hit this deadline.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="goal-card-footer">
                    {isAllocating ? (
                      <div className="allocate-wizard-form">
                        <input 
                          type="number" 
                          placeholder="Amount ($)" 
                          value={contributionAmt} 
                          onChange={e => setContributionAmt(e.target.value)} 
                          className="allocate-input"
                          autoFocus 
                        />
                        <button onClick={() => handleAllocate(goal.id)} className="btn btn-primary btn-sm">
                          Confirm
                        </button>
                        <button onClick={() => setActiveContributionId(null)} className="btn btn-secondary btn-sm">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setActiveContributionId(goal.id)} 
                        className="btn btn-secondary w-full btn-sm flex-center"
                        disabled={percent >= 100}
                      >
                        <ArrowUpRight size={14} /> 
                        <span>{percent >= 100 ? 'Goal Completed!' : 'Add Savings Funds'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Goal Creator Sidebar */}
        <div className="col-4 glass-panel creator-panel">
          <div className="flex-align-center gap-2">
            <Landmark size={18} className="text-primary" />
            <h3 className="section-title">Create Savings Goal</h3>
          </div>

          <form onSubmit={handleAddGoal} className="mt-4">
            <div className="form-group">
              <label>Goal Name</label>
              <input 
                type="text" 
                value={goalName} 
                onChange={e => setGoalName(e.target.value)} 
                placeholder="e.g. Vacation, Emergency Fund" 
                className="form-control" 
                required 
              />
            </div>

            <div className="form-group">
              <label>Target Amount ($)</label>
              <input 
                type="number" 
                value={goalTarget} 
                onChange={e => setGoalTarget(e.target.value)} 
                placeholder="0" 
                className="form-control" 
                required 
              />
            </div>

            <div className="form-group">
              <label>Deadline Date</label>
              <input 
                type="date" 
                value={goalDeadline} 
                onChange={e => setGoalDeadline(e.target.value)} 
                className="form-control" 
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary w-full mt-2">
              <Plus size={16} /> Create Goal
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .savings-view-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .goals-list-col {
          display: flex;
          flex-direction: column;
        }

        .goals-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        @media (max-width: 600px) {
          .goals-grid {
            grid-template-columns: 1fr;
          }
        }

        .goal-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .goal-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .goal-icon-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .goal-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .goal-name-text {
          font-size: 0.95rem;
          font-weight: 700;
          color: #fff;
        }

        .goal-deadline-label {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.7rem;
          color: var(--text-dim);
          font-weight: 550;
        }

        .goal-percent-badge {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--primary-hover);
        }

        .goal-card-body {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .goal-progress-bar {
          height: 8px;
          background: rgba(255,255,255,0.04);
          border-radius: 4px;
          overflow: hidden;
        }

        .goal-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary) 0%, #c084fc 100%);
          border-radius: 4px;
          transition: width 0.4s ease-out;
        }

        .goal-values-row {
          display: flex;
          justify-content: space-between;
        }

        .goal-val-group {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .val-lbl {
          font-size: 0.7rem;
          color: var(--text-dim);
          font-weight: 600;
          text-transform: uppercase;
        }

        .val-number {
          font-size: 0.95rem;
          color: #fff;
          font-family: var(--mono);
        }

        .ai-recommendation-box {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: 10px;
          background: var(--primary-glow);
          border: 1px solid rgba(139, 92, 246, 0.15);
        }

        .spark-icon {
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .recommendation-text {
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.4;
          font-weight: 550;
        }

        .goal-card-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .flex-center {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .allocate-wizard-form {
          display: flex;
          gap: 0.5rem;
          width: 100%;
        }

        .allocate-input {
          flex: 1;
          padding: 0.5rem;
          background: rgba(0,0,0,0.3);
          border: 1px solid var(--border-glass-hover);
          border-radius: 8px;
          color: #fff;
          font-family: inherit;
          font-size: 0.775rem;
          outline: none;
        }

        .creator-panel {
          padding: 1.5rem;
        }

        .flex-align-center {
          display: flex;
          align-items: center;
        }
        .gap-2 { gap: 0.5rem; }
      `}</style>
    </div>
  );
};
