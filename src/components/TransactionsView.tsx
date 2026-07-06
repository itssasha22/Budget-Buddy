import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  Plus, 
  Search, 
  Trash2, 
  Mic, 
  FileText, 
  Sparkles, 
  Upload, 
  Volume2,
  FileSpreadsheet
} from 'lucide-react';
import { TransactionCategory } from '../types/finance';

export const TransactionsView: React.FC = () => {
  const { 
    transactions, 
    addTransaction, 
    deleteTransaction, 
    simulateVoiceInput, 
    simulateReceiptScan, 
    importBankStatement 
  } = useFinance();

  // Navigation sub-tabs
  const [activeTab, setActiveTab] = useState<'manual' | 'voice' | 'receipt' | 'import'>('manual');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Manual entry state
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<TransactionCategory | 'Auto'>('Auto');

  // Voice entry state
  const [voiceText, setVoiceText] = useState('I spent 15 dollars on Uber');
  const [voiceFeedback, setVoiceFeedback] = useState('');

  // Receipt Scanner entry state
  const [receiptText, setReceiptText] = useState(`WHOLE FOODS MARKET
Store #10294 - Austin, TX
==========================
ORGANIC MILK       $6.99
AVOCADO BAG        $4.50
FRESH BLUEBERRIES  $5.99
SPINACH SALAD      $8.50
==========================
SUBTOTAL          $25.98
TAX                $2.02
TOTAL AMOUNT DUE  $28.00
==========================
THANK YOU FOR SHOPPING!`);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerFeedback, setScannerFeedback] = useState('');

  // CSV Import entry state
  const [csvText, setCsvText] = useState(`Date,Description,Amount,Type
2026-07-06,McDonalds Lunch,14.50,expense
2026-07-06,Stripe Payout Freelance,850.00,income
2026-07-05,Shell Gas station,48.00,expense
2026-07-05,Amazon Web Services,25.90,expense`);

  // Handle Manual Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    const finalCat = category === 'Auto' ? undefined : category;
    addTransaction(desc, parseFloat(amount), type, finalCat);
    setDesc('');
    setAmount('');
    setCategory('Auto');
  };

  // Handle Voice Command
  const handleVoiceSubmit = () => {
    if (!voiceText) return;
    const feedback = simulateVoiceInput(voiceText);
    setVoiceFeedback(feedback);
  };

  // Pre-load Voice templates
  const voiceTemplates = [
    'I spent 15 dollars on Uber',
    'Received three thousand dollars for salary',
    'Spent twelve dollars on coffee at Starbucks',
    'Added fifty dollars for gas station'
  ];

  // Handle Receipt scanner template triggers
  const handleReceiptScanSubmit = () => {
    setIsScanning(true);
    setScannerFeedback('');
    
    // Simulate scanner animation delay
    setTimeout(() => {
      setIsScanning(false);
      const res = simulateReceiptScan(receiptText);
      setScannerFeedback(`AI OCR Success: Detected ${res.itemsCount} items from "${autoCategorizeDescription(receiptText)}" totaling $${res.total.toFixed(2)} under category "${res.category}".`);
    }, 1800);
  };

  // Extract store name from text for feedback
  const autoCategorizeDescription = (txt: string): string => {
    const lines = txt.split('\n');
    const firstLine = lines.find(l => l.trim().length > 0) || 'Receipt';
    return firstLine.trim();
  };

  const receiptTemplates = [
    {
      title: 'Walmart Groceries ($112.50)',
      text: `WALMART SUPERCENTER
Store #3421 - Denver, CO
==========================
BANANAS            $2.50
ORGANIC BEEF      $18.90
PAPER TOWELS      $15.20
ICE CREAM          $5.90
FROZEN PIZZA      $12.50
DOG FOOD          $24.50
HOUSEHOLD DECOR   $33.00
==========================
TOTAL             $112.50`
    },
    {
      title: 'Netflix Subscription ($15.49)',
      text: `NETFLIX ENTERTAINMENT
BILLING INVOICE
==========================
MEMBERSHIP CHARGE  $15.49
TAX                 $0.00
==========================
TOTAL PAID         $15.49`
    }
  ];

  // Handle CSV Import
  const handleCsvSubmit = () => {
    if (!csvText) return;
    importBankStatement(csvText);
  };

  // Category badges color helper
  const getCategoryColor = (cat: string) => {
    const mapping: Record<string, string> = {
      Food: 'badge-success',
      Transport: 'badge-info',
      Housing: 'badge-warning',
      Utilities: 'badge-warning',
      Entertainment: 'badge-danger',
      Shopping: 'badge-info',
      Healthcare: 'badge-danger',
      Education: 'badge-success',
      Travel: 'badge-info',
      Investments: 'badge-success',
      Income: 'badge-success',
      Uncategorized: 'badge-warning'
    };
    return mapping[cat] || 'badge-info';
  };

  // Filter transaction list
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) || 
                          t.category.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="transactions-view-container animate-fade-in">
      <h1 className="page-title">Expense Tracking</h1>
      <p className="page-subtitle">Track your transactions manually, via voice commands, receipt scans, or bank CSV statement imports.</p>

      <div className="dashboard-grid">
        {/* Entry forms panel */}
        <div className="col-5 glass-panel entry-panel">
          <div className="entry-tabs">
            <button 
              onClick={() => setActiveTab('manual')} 
              className={`entry-tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
            >
              <Plus size={14} />
              <span>Manual</span>
            </button>
            <button 
              onClick={() => setActiveTab('voice')} 
              className={`entry-tab-btn ${activeTab === 'voice' ? 'active' : ''}`}
            >
              <Mic size={14} />
              <span>Voice AI</span>
            </button>
            <button 
              onClick={() => setActiveTab('receipt')} 
              className={`entry-tab-btn ${activeTab === 'receipt' ? 'active' : ''}`}
            >
              <FileText size={14} />
              <span>OCR Scan</span>
            </button>
            <button 
              onClick={() => setActiveTab('import')} 
              className={`entry-tab-btn ${activeTab === 'import' ? 'active' : ''}`}
            >
              <FileSpreadsheet size={14} />
              <span>CSV Bank</span>
            </button>
          </div>

          <div className="entry-tab-body">
            {/* Manual Form */}
            {activeTab === 'manual' && (
              <form onSubmit={handleManualSubmit}>
                <div className="form-group">
                  <label>Transaction Description</label>
                  <input 
                    type="text" 
                    value={desc} 
                    onChange={e => setDesc(e.target.value)} 
                    placeholder="e.g. Lunch with client, Uber, Netflix" 
                    className="form-control" 
                    required 
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Amount ($)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={amount} 
                      onChange={e => setAmount(e.target.value)} 
                      placeholder="0.00" 
                      className="form-control" 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Type</label>
                    <select 
                      value={type} 
                      onChange={e => setType(e.target.value as 'income' | 'expense')} 
                      className="form-control"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Smart Category</label>
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value as any)} 
                    className="form-control"
                  >
                    <option value="Auto">✨ Auto-Detect (AI Simulator)</option>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Housing">Housing</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Education">Education</option>
                    <option value="Travel">Travel</option>
                    <option value="Investments">Investments</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary w-full mt-2">
                  <Plus size={16} /> Add Transaction
                </button>
              </form>
            )}

            {/* Voice Input Sim */}
            {activeTab === 'voice' && (
              <div className="voice-sim-wrapper">
                <div className="mic-glow-container">
                  <div className="mic-circle pulsing">
                    <Mic size={24} className="mic-icon" />
                  </div>
                  <span className="mic-status-label">Voice Assistant Active</span>
                </div>

                <div className="form-group">
                  <label>Simulate Speech Text</label>
                  <input 
                    type="text" 
                    value={voiceText} 
                    onChange={e => setVoiceText(e.target.value)} 
                    placeholder="Describe transaction..." 
                    className="form-control" 
                  />
                </div>

                <div className="voice-presets">
                  <span className="preset-title">Or click a voice template:</span>
                  {voiceTemplates.map((template, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setVoiceText(template)} 
                      className="preset-tag"
                    >
                      <Volume2 size={12} />
                      <span>"{template}"</span>
                    </button>
                  ))}
                </div>

                <button onClick={handleVoiceSubmit} className="btn btn-primary w-full mt-3">
                  <Sparkles size={16} /> Process Voice Command
                </button>

                {voiceFeedback && (
                  <div className="ai-feedback success animate-fade-in">
                    <p>{voiceFeedback}</p>
                  </div>
                )}
              </div>
            )}

            {/* OCR Scanner Sim */}
            {activeTab === 'receipt' && (
              <div className="ocr-sim-wrapper">
                <div className="scanner-container">
                  {isScanning && <div className="laser-line"></div>}
                  <textarea 
                    value={receiptText} 
                    onChange={e => setReceiptText(e.target.value)} 
                    rows={8}
                    className="ocr-textarea" 
                    placeholder="Paste receipt text here..."
                    disabled={isScanning}
                  />
                </div>

                <div className="voice-presets">
                  <span className="preset-title">Select a demo receipt:</span>
                  {receiptTemplates.map((tpl, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setReceiptText(tpl.text)} 
                      className="preset-tag"
                      disabled={isScanning}
                    >
                      <Upload size={12} />
                      <span>{tpl.title}</span>
                    </button>
                  ))}
                </div>

                <button 
                  onClick={handleReceiptScanSubmit} 
                  className="btn btn-primary w-full mt-3"
                  disabled={isScanning}
                >
                  <Sparkles size={16} /> 
                  {isScanning ? 'Scanning with OCR...' : 'Scan Receipt'}
                </button>

                {scannerFeedback && (
                  <div className="ai-feedback success animate-fade-in">
                    <p>{scannerFeedback}</p>
                  </div>
                )}
              </div>
            )}

            {/* CSV Bank Import */}
            {activeTab === 'import' && (
              <div className="csv-import-wrapper">
                <div className="form-group">
                  <label>Paste CSV Bank Statement</label>
                  <textarea 
                    value={csvText} 
                    onChange={e => setCsvText(e.target.value)} 
                    rows={8}
                    className="ocr-textarea" 
                    placeholder="Date,Description,Amount,Type"
                  />
                </div>

                <button onClick={handleCsvSubmit} className="btn btn-primary w-full mt-2">
                  <Upload size={16} /> Import Statement
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Transactions list table panel */}
        <div className="col-7 glass-panel list-panel">
          <div className="list-filters-header">
            <h3 className="section-title">Transaction History</h3>
            <div className="filters-row">
              <div className="search-box">
                <Search size={14} className="search-icon" />
                <input 
                  type="text" 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  placeholder="Search description..." 
                />
              </div>

              <select value={filterType} onChange={e => setFilterType(e.target.value as any)} className="filter-select">
                <option value="all">All Types</option>
                <option value="expense">Expenses</option>
                <option value="income">Income</option>
              </select>

              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="filter-select">
                <option value="all">All Categories</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Housing">Housing</option>
                <option value="Utilities">Utilities</option>
                <option value="Shopping">Shopping</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Travel">Travel</option>
                <option value="Investments">Investments</option>
                <option value="Income">Income</option>
                <option value="Uncategorized">Uncategorized</option>
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            {filteredTransactions.length === 0 ? (
              <div className="empty-state">
                <span>No transactions found. Add some above!</span>
              </div>
            ) : (
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th className="text-right">Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id} className="table-row">
                      <td className="tx-date">{tx.date}</td>
                      <td>
                        <div className="tx-desc-container">
                          <span className="tx-description">{tx.description}</span>
                          {tx.isSubscription && <span className="sub-tag">Subscription</span>}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getCategoryColor(tx.category)}`}>
                          {tx.category}
                        </span>
                      </td>
                      <td className={`tx-amount text-right ${tx.type === 'income' ? 'text-success' : 'text-main'}`}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </td>
                      <td>
                        <button onClick={() => deleteTransaction(tx.id)} className="delete-row-btn" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .transactions-view-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .entry-panel {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
        }

        .entry-tabs {
          display: flex;
          background: rgba(0, 0, 0, 0.2);
          padding: 0.25rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
        }

        .entry-tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.5rem;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-family: inherit;
          font-size: 0.775rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .entry-tab-btn.active {
          background: var(--bg-dark);
          color: #fff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }

        .w-full {
          width: 100%;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        /* Voice Sim styles */
        .voice-sim-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .mic-glow-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          margin: 0.5rem 0;
        }

        .mic-circle {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }

        .pulsing {
          animation: pulseGlow 1.6s infinite alternate;
        }

        @keyframes pulseGlow {
          from {
            transform: scale(0.96);
            box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4);
          }
          to {
            transform: scale(1.04);
            box-shadow: 0 0 16px 4px rgba(139, 92, 246, 0.2);
          }
        }

        .mic-status-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-dim);
        }

        .voice-presets {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          width: 100%;
        }

        .preset-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-dim);
        }

        .preset-tag {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.5rem 0.75rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          color: var(--text-muted);
          font-family: inherit;
          font-size: 0.75rem;
          font-weight: 550;
          cursor: pointer;
          transition: var(--transition-smooth);
          text-align: left;
        }

        .preset-tag:hover {
          color: var(--text-main);
          border-color: rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
        }

        .ai-feedback {
          width: 100%;
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.775rem;
          line-height: 1.4;
          font-weight: 550;
          border: 1px solid var(--border-glass);
        }

        .ai-feedback.success {
          background: var(--success-glow);
          color: var(--success);
          border-color: rgba(16, 185, 129, 0.2);
        }

        /* OCR Sim styles */
        .scanner-container {
          position: relative;
          width: 100%;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border-glass);
        }

        .ocr-textarea {
          width: 100%;
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.3);
          border: none;
          color: var(--text-muted);
          font-family: var(--mono);
          font-size: 0.725rem;
          line-height: 1.4;
          resize: none;
          outline: none;
        }

        .laser-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--primary), transparent);
          box-shadow: 0 0 8px var(--primary);
          z-index: 2;
          animation: scanDown 1.8s infinite linear;
        }

        @keyframes scanDown {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }

        /* List styles */
        .list-panel {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .list-filters-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }

        .filters-row {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        @media (max-width: 600px) {
          .filters-row {
            flex-direction: column;
            width: 100%;
          }
          .search-box, .filter-select {
            width: 100%;
          }
        }

        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 0.875rem;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--border-glass);
          border-radius: 8px;
        }

        .search-box input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-main);
          font-family: inherit;
          font-size: 0.825rem;
          width: 100%;
        }

        .search-icon {
          color: var(--text-dim);
        }

        .filter-select {
          padding: 0.625rem 0.875rem;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          color: var(--text-muted);
          font-family: inherit;
          font-size: 0.825rem;
          outline: none;
          cursor: pointer;
        }

        .table-wrapper {
          overflow-x: auto;
          flex: 1;
        }

        .transactions-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.825rem;
          text-align: left;
        }

        .transactions-table th {
          padding: 0.75rem;
          border-bottom: 1px solid var(--border-glass);
          color: var(--text-dim);
          font-weight: 600;
          font-size: 0.775rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .transactions-table td {
          padding: 0.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.02);
          vertical-align: middle;
        }

        .table-row {
          transition: var(--transition-smooth);
        }
        .table-row:hover {
          background: rgba(255,255,255,0.01);
        }

        .tx-date {
          color: var(--text-dim);
          font-weight: 500;
        }

        .tx-desc-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .tx-description {
          font-weight: 600;
          color: var(--text-main);
        }

        .sub-tag {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--primary-hover);
          background: var(--primary-glow);
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
        }

        .tx-amount {
          font-weight: 700;
          font-family: var(--mono);
        }

        .text-right {
          text-align: right;
        }

        .delete-row-btn {
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          padding: 0.35rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-smooth);
        }

        .delete-row-btn:hover {
          color: #f87171;
          background: rgba(239,68,68,0.1);
        }

        .empty-state {
          padding: 3rem;
          text-align: center;
          color: var(--text-dim);
          font-size: 0.875rem;
          font-weight: 550;
        }
      `}</style>
    </div>
  );
};
