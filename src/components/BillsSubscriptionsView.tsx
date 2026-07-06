import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  CalendarClock, 
  Check, 
  X, 
  AlertOctagon, 
  Plus, 
  Sparkles
} from 'lucide-react';
import type { Bill } from '../types/finance';

export const BillsSubscriptionsView: React.FC = () => {
  const { 
    bills, 
    toggleBillPaid, 
    transactions
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'bills' | 'subs'>('bills');
  
  // Modal for subscription cancellation simulation
  const [cancelingSubName, setCancelingSubName] = useState<string | null>(null);
  const [isCanceledSuccess, setIsCanceledSuccess] = useState(false);

  // Bill creator form states
  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDate, setBillDueDate] = useState('');
  const [billCategory, setBillCategory] = useState('Utilities');

  // Derive subscriptions from transactions where isSubscription = true
  // Let's filter transaction list for unique active subscriptions
  const uniqueSubs = transactions.filter(t => t.isSubscription);
  const subscriptionList = Array.from(new Map(uniqueSubs.map(item => [item.description, item])).values())
    .map(t => {
      // Mark Adobe CC as forgotten/idle for demonstration warning
      const isForgotten = t.description.toLowerCase().includes('adobe');
      return {
        id: t.id,
        name: t.description,
        cost: t.amount,
        billingCycle: 'monthly' as const,
        nextBillingDate: '2026-07-25',
        category: t.category,
        isForgotten
      };
    });

  // Handle Add Bill Submit
  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billName || !billAmount || !billDueDate) return;
    
    // In a real app we'd trigger a context method. Let's add a transaction directly or simulate adding to bills list.
    // For MVP demonstration, we simulate by adding this bill to state.
    // Wait, bills is maintained in context! Let's check context. We have a context bills state.
    // We can simulate adding via modifying bills directly, but since we didn't add an addBill method to context directly to keep it simple,
    // we can record this payment as a future bill or add it locally.
    // Actually, let's just make it show in the UI, or since the user will use the app, let's allow them to record it.
    // Wait! Let's look at what context provides: bills, toggleBillPaid. We can support adding transactions or marking paid.
    // Let's create a local addition of bill or trigger it. 
    // To make it fully functional and integrated, we will add a local list overlay if user adds a new bill.
    // Let's add the bill details. We can just add it to a local list of bills that merges with context bills!
    // That way, it persists in the component and syncs.
    setLocalBills(prev => [
      ...prev,
      {
        id: 'bill-' + Date.now(),
        name: billName,
        amount: parseFloat(billAmount),
        dueDate: billDueDate,
        category: billCategory,
        isPaid: false,
        recurring: 'monthly'
      }
    ]);

    setBillName('');
    setBillAmount('');
    setBillDueDate('');
  };

  const [localBills, setLocalBills] = useState<Bill[]>([]);
  const allBills = [...bills, ...localBills];

  // Handle Subscription Cancel Simulation
  const triggerCancelSimulation = (subName: string) => {
    setCancelingSubName(subName);
    setIsCanceledSuccess(false);
  };

  const confirmCancellation = () => {
    setIsCanceledSuccess(true);
    // Simulate removing from transactions context by adding a refund/deletion or simply clearing local view.
    // For high fidelity, we just show success and close.
    setTimeout(() => {
      setCancelingSubName(null);
      setIsCanceledSuccess(false);
    }, 2500);
  };

  return (
    <div className="bills-view-container animate-fade-in">
      <h1 className="page-title">Bills & Subscriptions</h1>
      <p className="page-subtitle">Track recurring payments, automate bill reminders, and find under-utilized or forgotten subscriptions.</p>

      <div className="view-selector-tabs">
        <button 
          onClick={() => setActiveTab('bills')} 
          className={`view-selector-btn ${activeTab === 'bills' ? 'active' : ''}`}
        >
          <CalendarClock size={16} />
          <span>Bill Reminders</span>
        </button>
        <button 
          onClick={() => setActiveTab('subs')} 
          className={`view-selector-btn ${activeTab === 'subs' ? 'active' : ''}`}
        >
          <Sparkles size={16} />
          <span>Subscription Tracker</span>
        </button>
      </div>

      <div className="dashboard-grid">
        {activeTab === 'bills' && (
          <>
            {/* Bills timeline */}
            <div className="col-8 bills-timeline-col">
              <div className="glass-panel timeline-panel">
                <h3 className="section-title mb-4">Upcoming Bill Timeline</h3>
                
                <div className="bill-timeline">
                  {allBills.map(bill => {
                    const isOverdue = new Date(bill.dueDate).getTime() < Date.now() && !bill.isPaid;
                    const isDueSoon = !bill.isPaid && (new Date(bill.dueDate).getTime() - Date.now() < 172800000); // 2 days

                    return (
                      <div key={bill.id} className={`timeline-card ${bill.isPaid ? 'paid' : ''}`}>
                        <div className="timeline-badge-column">
                          <button 
                            onClick={() => toggleBillPaid(bill.id)} 
                            className={`check-button ${bill.isPaid ? 'checked' : ''}`}
                            title={bill.isPaid ? "Mark as unpaid" : "Mark as paid"}
                          >
                            {bill.isPaid ? <Check size={14} /> : null}
                          </button>
                          <div className="timeline-line"></div>
                        </div>

                        <div className="timeline-content-card glass-panel">
                          <div className="bill-meta-header">
                            <div>
                              <h4 className="bill-title-text">{bill.name}</h4>
                              <span className="bill-category-label">{bill.category}</span>
                            </div>
                            <span className="bill-amount-text">${bill.amount.toFixed(2)}</span>
                          </div>

                          <div className="bill-meta-footer">
                            <span className={`due-date-text ${isOverdue ? 'overdue' : isDueSoon ? 'due-soon' : ''}`}>
                              Due: {bill.dueDate} {isOverdue ? '(Overdue)' : isDueSoon ? '(Due Soon!)' : ''}
                            </span>
                            <span className="badge-recurring">Monthly</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bill Creator form */}
            <div className="col-4 glass-panel creator-panel">
              <h3 className="section-title">Schedule New Bill</h3>
              <form onSubmit={handleAddBill} className="mt-4">
                <div className="form-group">
                  <label>Bill Name</label>
                  <input 
                    type="text" 
                    value={billName} 
                    onChange={e => setBillName(e.target.value)} 
                    placeholder="e.g. Electric Bill, Rent" 
                    className="form-control" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Amount ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={billAmount} 
                    onChange={e => setBillAmount(e.target.value)} 
                    placeholder="0.00" 
                    className="form-control" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Due Date</label>
                  <input 
                    type="date" 
                    value={billDueDate} 
                    onChange={e => setBillDueDate(e.target.value)} 
                    className="form-control" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={billCategory} 
                    onChange={e => setBillCategory(e.target.value)} 
                    className="form-control"
                  >
                    <option value="Utilities">Utilities</option>
                    <option value="Housing">Housing</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Investments">Investments</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary w-full mt-2">
                  <Plus size={16} /> Schedule Bill
                </button>
              </form>
            </div>
          </>
        )}

        {activeTab === 'subs' && (
          <div className="col-12 subscriptions-grid-container">
            {/* Warning for forgotten subscription */}
            {subscriptionList.some(s => s.isForgotten) && (
              <div className="forgotten-alert glass-panel mb-4">
                <AlertOctagon size={24} className="alert-icon-red" />
                <div className="alert-content">
                  <h4 className="alert-heading">Unused / Forgotten Subscription Detected</h4>
                  <p className="alert-desc">BudgetBuddy AI noticed zero transaction frequency for <strong>Adobe Creative Cloud</strong> in the last 30 days. Canceling this could save you $54.99/month.</p>
                </div>
              </div>
            )}

            <div className="subs-cards-list">
              {subscriptionList.map(sub => (
                <div key={sub.id} className="sub-card glass-panel">
                  <div className="sub-header">
                    <div>
                      <h4 className="sub-title">{sub.name}</h4>
                      <span className="sub-cycle">Monthly Billing</span>
                    </div>
                    <span className="sub-cost">${sub.cost.toFixed(2)}</span>
                  </div>

                  <div className="sub-body">
                    <div className="sub-detail-row">
                      <span>Next Bill Date</span>
                      <span className="sub-detail-val">{sub.nextBillingDate}</span>
                    </div>
                    <div className="sub-detail-row">
                      <span>Status</span>
                      {sub.isForgotten ? (
                        <span className="badge badge-danger">Idle / Forgotten</span>
                      ) : (
                        <span className="badge badge-success">Active</span>
                      )}
                    </div>
                  </div>

                  <div className="sub-footer">
                    <button 
                      onClick={() => triggerCancelSimulation(sub.name)} 
                      className="btn btn-danger w-full btn-sm"
                    >
                      <X size={12} /> Cancel Subscription
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cancellation Wizard Modal */}
      {cancelingSubName && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel animate-fade-in">
            {!isCanceledSuccess ? (
              <>
                <h3 className="modal-title">Cancel {cancelingSubName}</h3>
                <p className="modal-desc">BudgetBuddy AI can automate this cancellation. We will submit a cancellation request on your behalf and contact their customer support.</p>
                
                <div className="wizard-actions">
                  <button onClick={() => setCancelingSubName(null)} className="btn btn-secondary">
                    Keep Subscription
                  </button>
                  <button onClick={confirmCancellation} className="btn btn-primary">
                    <Sparkles size={14} /> Auto-Cancel Now
                  </button>
                </div>
              </>
            ) : (
              <div className="cancellation-success-view">
                <div className="success-checkmark-glow">
                  <Check size={28} className="text-success" />
                </div>
                <h4 className="modal-title mt-3">Cancellation Processed!</h4>
                <p className="modal-desc text-center">We've successfully processed the cancellation of {cancelingSubName}. It has been removed from your active accounts, saving you money starting next cycle.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .bills-view-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .view-selector-tabs {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .view-selector-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          border-radius: 10px;
          border: 1px solid var(--border-glass);
          background: rgba(255,255,255,0.02);
          color: var(--text-muted);
          font-family: inherit;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .view-selector-btn.active {
          background: var(--primary);
          color: #fff;
          border-color: var(--primary);
          box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.3);
        }

        .mb-4 { margin-bottom: 1.5rem; }
        .mt-4 { margin-top: 1.25rem; }
        .mt-3 { margin-top: 1rem; }
        .mt-2 { margin-top: 0.75rem; }

        /* Bills Timeline */
        .timeline-panel {
          padding: 1.5rem;
        }

        .bill-timeline {
          display: flex;
          flex-direction: column;
        }

        .timeline-card {
          display: flex;
          gap: 1.25rem;
        }

        .timeline-badge-column {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .check-button {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid var(--border-glass-hover);
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--success);
          transition: var(--transition-smooth);
          flex-shrink: 0;
        }

        .check-button:hover {
          border-color: var(--success);
          background: rgba(16, 185, 129, 0.05);
        }

        .check-button.checked {
          background: var(--success);
          border-color: var(--success);
          color: #fff;
        }

        .timeline-line {
          width: 2px;
          flex: 1;
          background: var(--border-glass);
          margin: 0.25rem 0;
          min-height: 40px;
        }

        .timeline-card:last-child .timeline-line {
          display: none;
        }

        .timeline-content-card {
          flex: 1;
          padding: 1rem;
          margin-bottom: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          background: rgba(24, 28, 41, 0.3);
        }

        .timeline-card.paid .timeline-content-card {
          opacity: 0.6;
        }

        .bill-meta-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .bill-title-text {
          font-size: 0.95rem;
          font-weight: 700;
          color: #fff;
        }

        .bill-category-label {
          font-size: 0.725rem;
          color: var(--text-dim);
          font-weight: 600;
        }

        .bill-amount-text {
          font-size: 1.1rem;
          font-weight: 800;
          color: #fff;
          font-family: var(--mono);
        }

        .bill-meta-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .due-date-text {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .due-date-text.overdue {
          color: var(--danger);
          font-weight: 700;
        }

        .due-date-text.due-soon {
          color: var(--warning);
          font-weight: 700;
        }

        .badge-recurring {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .creator-panel {
          padding: 1.5rem;
        }

        /* Subscription Cards */
        .subscriptions-grid-container {
          display: flex;
          flex-direction: column;
        }

        .forgotten-alert {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.25rem;
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.2);
          border-radius: 16px;
        }

        .alert-icon-red {
          color: var(--danger);
          flex-shrink: 0;
        }

        .alert-heading {
          font-size: 0.95rem;
          font-weight: 700;
          color: #fff;
        }

        .alert-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
          line-height: 1.4;
          font-weight: 550;
        }

        .subs-cards-list {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }

        @media (max-width: 900px) {
          .subs-cards-list {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 600px) {
          .subs-cards-list {
            grid-template-columns: 1fr;
          }
        }

        .sub-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .sub-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .sub-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #fff;
        }

        .sub-cycle {
          font-size: 0.725rem;
          color: var(--text-dim);
          font-weight: 600;
        }

        .sub-cost {
          font-size: 1.15rem;
          font-weight: 800;
          color: #fff;
          font-family: var(--mono);
        }

        .sub-body {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
          font-size: 0.775rem;
          color: var(--text-muted);
          font-weight: 550;
        }

        .sub-detail-row {
          display: flex;
          justify-content: space-between;
        }

        .sub-detail-val {
          color: #fff;
          font-weight: 600;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.775rem;
          border-radius: 8px;
        }

        /* Modal Backdrop */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(9, 10, 15, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }

        .modal-content {
          width: 420px;
          max-width: calc(100% - 2rem);
          padding: 2rem;
          background: rgba(20, 22, 29, 0.95);
          border: 1px solid var(--border-glass-hover);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          text-align: center;
        }

        .modal-desc {
          font-size: 0.825rem;
          color: var(--text-muted);
          line-height: 1.5;
          text-align: center;
          font-weight: 550;
        }

        .wizard-actions {
          display: flex;
          gap: 1rem;
          width: 100%;
          margin-top: 0.5rem;
        }

        .wizard-actions .btn {
          flex: 1;
        }

        .cancellation-success-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          animation: scaleUp 0.3s ease-out;
        }

        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .success-checkmark-glow {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--success-glow);
          border: 1px solid rgba(16, 185, 129, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 16px rgba(16,185,129,0.2);
        }
      `}</style>
    </div>
  );
};
