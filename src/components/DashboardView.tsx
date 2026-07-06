import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ShieldAlert, 
  Lightbulb, 
  ArrowRight, 
  Sparkles, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
export const DashboardView: React.FC = () => {
  const { 
    transactions, 
    bills, 
    savingsGoals, 
    insights, 
    healthScore,
    setActiveView 
  } = useFinance();

  const [hoveredScore, setHoveredScore] = useState(false);

  // Financial calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalIncome - totalExpense;

  // Upcoming bills
  const upcomingBills = bills
    .filter(b => !b.isPaid)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 2);

  // Active savings goals
  const activeGoals = savingsGoals.slice(0, 2);

  // SVG Area Chart Data generation: aggregate last 7 days of expenses
  // Let's create mock dates representing the last 7 days to display on the chart
  const getLast7DaysData = () => {
    const data: { label: string; expense: number; income: number }[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayExpense = transactions
        .filter(t => t.type === 'expense' && t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);

      const dayIncome = transactions
        .filter(t => t.type === 'income' && t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);
      
      // format e.g. "Jul 05"
      const label = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      data.push({ label, expense: dayExpense, income: dayIncome });
    }
    return data;
  };

  const chartData = getLast7DaysData();
  const maxVal = Math.max(...chartData.map(d => Math.max(d.expense, d.income, 50)));

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 20;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  // Coordinates helper
  const getCoordinates = (index: number, val: number) => {
    const x = paddingX + (index / (chartData.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - (val / maxVal) * chartHeight;
    return { x, y };
  };

  // Build SVG path for expense area
  let expensePath = '';
  let expenseAreaPath = '';
  chartData.forEach((d, idx) => {
    const { x, y } = getCoordinates(idx, d.expense);
    if (idx === 0) {
      expensePath = `M ${x} ${y}`;
      expenseAreaPath = `M ${x} ${paddingY + chartHeight} L ${x} ${y}`;
    } else {
      expensePath += ` L ${x} ${y}`;
      expenseAreaPath += ` L ${x} ${y}`;
    }
    if (idx === chartData.length - 1) {
      expenseAreaPath += ` L ${x} ${paddingY + chartHeight} Z`;
    }
  });

  // Build SVG path for income area
  let incomePath = '';
  let incomeAreaPath = '';
  chartData.forEach((d, idx) => {
    const { x, y } = getCoordinates(idx, d.income);
    if (idx === 0) {
      incomePath = `M ${x} ${y}`;
      incomeAreaPath = `M ${x} ${paddingY + chartHeight} L ${x} ${y}`;
    } else {
      incomePath += ` L ${x} ${y}`;
      incomeAreaPath += ` L ${x} ${y}`;
    }
    if (idx === chartData.length - 1) {
      incomeAreaPath += ` L ${x} ${paddingY + chartHeight} Z`;
    }
  });

  // Health Score color mapping
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 65) return 'var(--info)';
    if (score >= 45) return 'var(--warning)';
    return 'var(--danger)';
  };

  // Ring calculations
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (healthScore.score / 100) * circumference;

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Personal Finance Companion</h1>
          <p className="page-subtitle">Your real-time automated AI wealth analytics</p>
        </div>

        <button onClick={() => setActiveView('transactions')} className="btn btn-primary">
          <Sparkles size={16} />
          <span>New Transaction</span>
        </button>
      </div>

      {/* Top row cards */}
      <div className="dashboard-grid">
        {/* Income Card */}
        <div className="col-4 glass-panel stat-card">
          <div className="stat-card-info">
            <span className="stat-card-label">Total Income</span>
            <span className="stat-card-value">${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="stat-card-trend text-success">
              <TrendingUp size={14} /> +12.4% vs last month
            </span>
          </div>
          <div className="stat-card-icon bg-success-glow">
            <TrendingUp size={24} style={{ color: 'var(--success)' }} />
          </div>
        </div>

        {/* Expense Card */}
        <div className="col-4 glass-panel stat-card">
          <div className="stat-card-info">
            <span className="stat-card-label">Total Expenses</span>
            <span className="stat-card-value">${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="stat-card-trend text-danger">
              <TrendingDown size={14} /> -4.1% vs last week
            </span>
          </div>
          <div className="stat-card-icon bg-danger-glow">
            <TrendingDown size={24} style={{ color: 'var(--danger)' }} />
          </div>
        </div>

        {/* Savings Card */}
        <div className="col-4 glass-panel stat-card">
          <div className="stat-card-info">
            <span className="stat-card-label">Net Savings</span>
            <span className="stat-card-value" style={{ color: netSavings >= 0 ? '#fff' : 'var(--danger)' }}>
              ${netSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="stat-card-trend text-info">
              <Wallet size={14} /> Savings rate: {totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0}%
            </span>
          </div>
          <div className="stat-card-icon bg-info-glow">
            <Wallet size={24} style={{ color: 'var(--info)' }} />
          </div>
        </div>

        {/* Health Score & Insights Row */}
        <div className="col-8 glass-panel chart-panel">
          <h3 className="section-title">Spending & Cash Flow (Last 7 Days)</h3>
          
          <div className="custom-chart-wrapper">
            <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--danger)" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="var(--danger)" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--success)" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="var(--success)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Horizontal Grid lines */}
              <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
              <line x1={paddingX} y1={paddingY + chartHeight / 2} x2={svgWidth - paddingX} y2={paddingY + chartHeight / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
              <line x1={paddingX} y1={paddingY + chartHeight} x2={svgWidth - paddingX} y2={paddingY + chartHeight} stroke="rgba(255,255,255,0.1)" />

              {/* Area and Line for Income */}
              {incomePath && (
                <>
                  <path d={incomeAreaPath} fill="url(#incomeGradient)" />
                  <path d={incomePath} fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" />
                </>
              )}

              {/* Area and Line for Expenses */}
              {expensePath && (
                <>
                  <path d={expenseAreaPath} fill="url(#expenseGradient)" />
                  <path d={expensePath} fill="none" stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round" />
                </>
              )}

              {/* Grid dots / active points on hover */}
              {chartData.map((d, idx) => {
                const eCoord = getCoordinates(idx, d.expense);
                const iCoord = getCoordinates(idx, d.income);
                return (
                  <g key={idx} className="chart-dot-group">
                    {d.expense > 0 && (
                      <circle cx={eCoord.x} cy={eCoord.y} r="4" fill="var(--danger)" stroke="var(--bg-dark)" strokeWidth="1.5" />
                    )}
                    {d.income > 0 && (
                      <circle cx={iCoord.x} cy={iCoord.y} r="4" fill="var(--success)" stroke="var(--bg-dark)" strokeWidth="1.5" />
                    )}
                    <text 
                      x={eCoord.x} 
                      y={svgHeight - 4} 
                      textAnchor="middle" 
                      fill="var(--text-muted)" 
                      fontSize="9"
                      fontWeight="600"
                    >
                      {d.label}
                    </text>
                  </g>
                );
              })}
            </svg>
            
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-dot bg-success"></span>
                <span>Income</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot bg-danger"></span>
                <span>Expenses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Health Score Widget */}
        <div 
          className="col-4 glass-panel score-card"
          onMouseEnter={() => setHoveredScore(true)}
          onMouseLeave={() => setHoveredScore(false)}
        >
          <div className="card-header-with-badge">
            <h3 className="section-title">Health Score</h3>
            <span className="info-tooltip-anchor">
              <HelpCircle size={14} className="text-dim" />
              {hoveredScore && (
                <div className="score-details-popup glass-panel">
                  <h4 className="popup-title">Financial Breakdown</h4>
                  <div className="popup-row">
                    <span>Savings Rate</span>
                    <span className="text-success">{healthScore.breakdown.savingsRate}%</span>
                  </div>
                  <div className="popup-row">
                    <span>Budget Adherence</span>
                    <span className="text-info">{healthScore.breakdown.budgetAdherence}%</span>
                  </div>
                  <div className="popup-row">
                    <span>Bill Consistency</span>
                    <span className="text-success">{healthScore.breakdown.billConsistency}%</span>
                  </div>
                  <div className="popup-row">
                    <span>Emergency Cover</span>
                    <span className="text-warning">{healthScore.breakdown.emergencyFund} mo</span>
                  </div>
                  <div className="popup-row">
                    <span>Investment Ratio</span>
                    <span>Excellent</span>
                  </div>
                </div>
              )}
            </span>
          </div>

          <div className="score-gauge-wrapper">
            <svg width="120" height="120" viewBox="0 0 100 100">
              <circle
                className="score-ring-bg"
                stroke="rgba(255,255,255,0.03)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={50}
                cy={50}
              />
              <circle
                className="score-ring-fill"
                stroke={getScoreColor(healthScore.score)}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={50}
                cy={50}
              />
              <text x="50%" y="46%" textAnchor="middle" dy=".3em" className="score-ring-number">
                {healthScore.score}
              </text>
              <text x="50%" y="68%" textAnchor="middle" className="score-ring-label">
                /100
              </text>
            </svg>
          </div>

          <div className="score-rating-text" style={{ color: getScoreColor(healthScore.score) }}>
            {healthScore.rating}
          </div>
          <p className="score-subtext">Score calculated dynamically by BudgetBuddy AI based on spending & emergency reserves.</p>
        </div>

        {/* Insights Panel */}
        <div className="col-8 glass-panel insights-panel">
          <h3 className="section-title">AI Spending Insights</h3>
          <div className="insights-list">
            {insights.map(insight => (
              <div key={insight.id} className="insight-card">
                <div className={`insight-bullet ${insight.type}`}>
                  {insight.type === 'warning' ? <ShieldAlert size={16} /> : <Lightbulb size={16} />}
                </div>
                <div className="insight-content">
                  <p className="insight-text">{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Mini Previews */}
        <div className="col-4 glass-panel preview-panel">
          <div className="preview-header">
            <h3 className="section-title">Upcoming Bills</h3>
            <button onClick={() => setActiveView('bills')} className="text-btn">
              <span>View All</span> <ArrowRight size={12} />
            </button>
          </div>

          <div className="preview-list">
            {upcomingBills.length === 0 ? (
              <div className="empty-preview">
                <CheckCircle size={20} className="text-success" />
                <span>All caught up! No bills due.</span>
              </div>
            ) : (
              upcomingBills.map(bill => (
                <div key={bill.id} className="preview-item">
                  <div className="item-meta">
                    <span className="item-title">{bill.name}</span>
                    <span className="item-sub text-danger">Due: {bill.dueDate}</span>
                  </div>
                  <span className="item-value font-semibold">${bill.amount}</span>
                </div>
              ))
            )}
          </div>

          <div className="preview-header border-top">
            <h3 className="section-title">Savings Progress</h3>
            <button onClick={() => setActiveView('savings')} className="text-btn">
              <span>View Goals</span> <ArrowRight size={12} />
            </button>
          </div>

          <div className="preview-list">
            {activeGoals.map(goal => {
              const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              return (
                <div key={goal.id} className="goal-preview-item">
                  <div className="goal-meta">
                    <span className="item-title">{goal.name}</span>
                    <span className="item-sub">{percent}% (${goal.currentAmount}/${goal.targetAmount})</span>
                  </div>
                  <div className="goal-progress-bar">
                    <div className="goal-progress-fill" style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        @media (max-width: 600px) {
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }

        .stat-card-trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.775rem;
          font-weight: 600;
          margin-top: 0.25rem;
        }

        .text-success { color: var(--success); }
        .text-danger { color: var(--danger); }
        .text-info { color: var(--info); }
        .text-dim { color: var(--text-dim); }

        .bg-success-glow { background: var(--success-glow); }
        .bg-danger-glow { background: var(--danger-glow); }
        .bg-info-glow { background: var(--info-glow); }

        /* Chart styles */
        .chart-panel {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--text-main);
        }

        .custom-chart-wrapper {
          position: relative;
          height: 220px;
          width: 100%;
        }

        .chart-legend {
          position: absolute;
          top: 0;
          right: 0;
          display: flex;
          gap: 1rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .chart-dot-group circle {
          transition: r 0.2s ease;
        }
        .chart-dot-group:hover circle {
          r: 6;
        }

        /* Health Score Ring styles */
        .score-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .card-header-with-badge {
          display: flex;
          justify-content: space-between;
          width: 100%;
          align-items: center;
          margin-bottom: auto;
        }

        .info-tooltip-anchor {
          position: relative;
          cursor: pointer;
        }

        .score-details-popup {
          position: absolute;
          top: 24px;
          right: -10px;
          width: 200px;
          padding: 0.875rem;
          background: rgba(13, 14, 21, 0.98);
          border: 1px solid var(--border-glass-hover);
          border-radius: 12px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          animation: fadeIn 0.2s ease-out;
        }

        .popup-title {
          font-size: 0.775rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--primary);
          margin-bottom: 0.25rem;
        }

        .popup-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .score-gauge-wrapper {
          transform: rotate(-90deg);
          margin: 1rem 0;
        }

        .score-ring-fill {
          transition: stroke-dashoffset 0.6s ease-in-out;
        }

        .score-ring-number {
          font-size: 1.75rem;
          font-weight: 800;
          fill: #fff;
          transform: rotate(90deg);
          transform-origin: center;
        }

        .score-ring-label {
          font-size: 0.7rem;
          font-weight: 600;
          fill: var(--text-muted);
          transform: rotate(90deg);
          transform-origin: center;
        }

        .score-rating-text {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          margin-bottom: 0.25rem;
        }

        .score-subtext {
          font-size: 0.7rem;
          color: var(--text-dim);
          text-align: center;
          line-height: 1.4;
        }

        /* Insights styles */
        .insights-panel {
          padding: 1.5rem;
        }

        .insights-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .insight-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 0.875rem 1rem;
          border-radius: 12px;
          background: rgba(255,255,255,0.01);
          border: 1px solid var(--border-glass);
          transition: var(--transition-smooth);
        }

        .insight-card:hover {
          border-color: rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.02);
        }

        .insight-bullet {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .insight-bullet.warning {
          background: var(--warning-glow);
          color: var(--warning);
        }

        .insight-bullet.info {
          background: var(--info-glow);
          color: var(--info);
        }

        .insight-bullet.success {
          background: var(--success-glow);
          color: var(--success);
        }

        .insight-text {
          font-size: 0.825rem;
          line-height: 1.5;
          color: var(--text-muted);
          font-weight: 550;
        }

        /* Previews panel styles */
        .preview-panel {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .preview-header.border-top {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-glass);
        }

        .text-btn {
          background: transparent;
          border: none;
          color: var(--primary);
          font-family: inherit;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          transition: var(--transition-smooth);
        }

        .text-btn:hover {
          color: var(--primary-hover);
        }

        .preview-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .preview-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.625rem 0.875rem;
          background: rgba(0,0,0,0.15);
          border-radius: 10px;
          border: 1px solid var(--border-glass);
        }

        .item-meta {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .item-title {
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .item-sub {
          font-size: 0.7rem;
          font-weight: 500;
        }

        .item-value {
          font-size: 0.875rem;
          color: #fff;
        }

        .empty-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1.5rem;
          text-align: center;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 550;
        }

        /* Goal previews */
        .goal-preview-item {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          padding: 0.5rem 0.25rem;
        }

        .goal-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.775rem;
          font-weight: 600;
        }

        .goal-progress-bar {
          height: 6px;
          background: rgba(255,255,255,0.04);
          border-radius: 3px;
          overflow: hidden;
        }

        .goal-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary) 0%, #c084fc 100%);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};
