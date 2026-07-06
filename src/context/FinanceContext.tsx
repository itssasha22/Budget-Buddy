import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  Transaction, 
  Budget, 
  Bill, 
  SavingsGoal, 
  SpendingInsight, 
  FinancialHealthScore, 
  FinanceNotification, 
  TransactionCategory 
} from '../types/finance';
import { 
  autoCategorize, 
  calculateFinancialHealthScore, 
  generateSpendingInsights, 
  getTriggeredNotifications, 
  calculateRecommendedWeeklySavings 
} from '../services/aiSimulator';

interface FinanceContextType {
  transactions: Transaction[];
  budgets: Budget[];
  bills: Bill[];
  savingsGoals: SavingsGoal[];
  insights: SpendingInsight[];
  healthScore: FinancialHealthScore;
  notifications: FinanceNotification[];
  activeView: string;
  setActiveView: (view: string) => void;
  addTransaction: (desc: string, amount: number, type: 'income' | 'expense', category?: TransactionCategory) => void;
  deleteTransaction: (id: string) => void;
  importBankStatement: (csvText: string) => void;
  updateBudgetLimit: (category: Budget['category'], limit: number) => void;
  toggleBillPaid: (id: string) => void;
  addSavingsGoal: (name: string, target: number, deadline: string) => void;
  updateSavingsProgress: (id: string, amount: number) => void;
  markNotificationAsRead: (id: string) => void;
  simulateVoiceInput: (speechText: string) => string; // Returns outcome description
  simulateReceiptScan: (receiptText: string) => { itemsCount: number; total: number; category: TransactionCategory };
  resetAll: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', description: 'Monthly Salary', amount: 3200, type: 'income', category: 'Income', date: '2026-07-01' },
  { id: 't2', description: 'Apartment Rent', amount: 1200, type: 'expense', category: 'Housing', date: '2026-07-01' },
  { id: 't3', description: 'Starbucks Coffee', amount: 6.50, type: 'expense', category: 'Food', date: '2026-07-02' },
  { id: 't4', description: 'Uber Trip', amount: 15.00, type: 'expense', category: 'Transport', date: '2026-07-02' },
  { id: 't5', description: 'Netflix Subscription', amount: 15.49, type: 'expense', category: 'Entertainment', date: '2026-07-03', isSubscription: true },
  { id: 't6', description: 'Weekly Groceries Walmart', amount: 112.50, type: 'expense', category: 'Food', date: '2026-07-04' },
  { id: 't7', description: 'Adobe Creative Cloud', amount: 54.99, type: 'expense', category: 'Entertainment', date: '2026-07-05', isSubscription: true }, // Forgotten sub representation
  { id: 't8', description: 'Spotify Premium', amount: 10.99, type: 'expense', category: 'Entertainment', date: '2026-07-05', isSubscription: true },
  { id: 't9', description: 'Gas Station Fuel', amount: 45.00, type: 'expense', category: 'Transport', date: '2026-07-05' },
  { id: 't10', description: 'Pharmacy Prescription', amount: 22.00, type: 'expense', category: 'Healthcare', date: '2026-07-06' }
];

const INITIAL_BUDGETS: Budget[] = [
  { category: 'Food', limit: 300, spent: 119 },
  { category: 'Transport', limit: 150, spent: 60 },
  { category: 'Shopping', limit: 100, spent: 0 },
  { category: 'Utilities', limit: 200, spent: 0 },
  { category: 'Entertainment', limit: 120, spent: 81.47 }
];

const INITIAL_BILLS: Bill[] = [
  { id: 'b1', name: 'Apartment Rent', amount: 1200, dueDate: '2026-07-05', category: 'Housing', isPaid: true, recurring: 'monthly' },
  { id: 'b2', name: 'Comcast Internet', amount: 60, dueDate: '2026-07-15', category: 'Utilities', isPaid: false, recurring: 'monthly' },
  { id: 'b3', name: 'Power & Light Electricity', amount: 95, dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], category: 'Utilities', isPaid: false, recurring: 'monthly' }, // Due tomorrow
  { id: 'b4', name: 'Car Insurance', amount: 110, dueDate: '2026-07-20', category: 'Healthcare', isPaid: false, recurring: 'monthly' }
];

const INITIAL_GOALS: SavingsGoal[] = [
  { id: 'g1', name: 'Summer Vacation 2026', targetAmount: 2000, currentAmount: 650, deadline: '2026-12-15', recommendedWeeklySavings: 0 },
  { id: 'g2', name: 'Emergency Fund', targetAmount: 5000, currentAmount: 1500, deadline: '2027-06-30', recommendedWeeklySavings: 0 }
];

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('bb_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('bb_budgets');
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('bb_bills');
    return saved ? JSON.parse(saved) : INITIAL_BILLS;
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('bb_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [notifications, setNotifications] = useState<FinanceNotification[]>([]);
  const [activeView, setActiveView] = useState<string>('dashboard');

  // Trigger LocalStorage save and re-run simulator updates when core state changes
  useEffect(() => {
    localStorage.setItem('bb_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('bb_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('bb_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('bb_goals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  // Dynamically calculate budgets spent amounts whenever transactions change
  useEffect(() => {
    const updatedBudgets = budgets.map(b => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === b.category)
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...b, spent: Math.round(spent * 100) / 100 };
    });
    // Simple deep equality check to prevent infinite loop
    if (JSON.stringify(updatedBudgets) !== JSON.stringify(budgets)) {
      setBudgets(updatedBudgets);
    }
  }, [transactions]);

  // Recalculate savings recommendations
  useEffect(() => {
    const updatedGoals = savingsGoals.map(g => {
      const rec = calculateRecommendedWeeklySavings(g.targetAmount, g.currentAmount, g.deadline);
      return { ...g, recommendedWeeklySavings: rec };
    });
    if (JSON.stringify(updatedGoals) !== JSON.stringify(savingsGoals)) {
      setSavingsGoals(updatedGoals);
    }
  }, [savingsGoals]);

  // Evaluate notifications on changes
  useEffect(() => {
    const triggered = getTriggeredNotifications(transactions, budgets, bills);
    setNotifications(prev => {
      // Keep user's read states if they already exist
      const updated = triggered.map(t => {
        const existing = prev.find(p => p.id === t.id);
        return existing ? { ...t, read: existing.read } : t;
      });
      // also keep previous alerts that might not be in active triggers
      const unreadOld = prev.filter(p => !p.read && !updated.some(u => u.id === p.id));
      return [...unreadOld, ...updated];
    });
  }, [transactions, budgets, bills]);

  // Generate score and insights dynamically
  const healthScore = calculateFinancialHealthScore(transactions, budgets, bills, savingsGoals);
  const insights = generateSpendingInsights(transactions, budgets, bills);

  // Core Actions
  const addTransaction = (
    desc: string, 
    amount: number, 
    type: 'income' | 'expense', 
    category?: TransactionCategory
  ) => {
    const finalCategory = category || autoCategorize(desc);
    
    // Check if subscription keywords are present
    const isSub = type === 'expense' && (
      desc.toLowerCase().includes('netflix') || 
      desc.toLowerCase().includes('spotify') || 
      desc.toLowerCase().includes('hulu') || 
      desc.toLowerCase().includes('adobe') || 
      desc.toLowerCase().includes('disney') || 
      desc.toLowerCase().includes('premium') || 
      desc.toLowerCase().includes('subscription')
    );

    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      description: desc,
      amount: Math.abs(amount),
      type,
      category: finalCategory,
      date: new Date().toISOString().split('T')[0],
      isSubscription: isSub
    };

    setTransactions(prev => [newTx, ...prev]);

    // Push instant notification toast if budget limit exceeded
    if (type === 'expense' && finalCategory !== 'Uncategorized') {
      const b = budgets.find(bg => bg.category === finalCategory);
      if (b) {
        const nextSpent = b.spent + amount;
        if (nextSpent >= b.limit) {
          const toast: FinanceNotification = {
            id: 'toast-' + Date.now(),
            type: 'alert',
            message: `ALERT: You just exceeded your ${finalCategory} budget limit!`,
            timestamp: new Date().toISOString(),
            read: false
          };
          setNotifications(prev => [toast, ...prev]);
        } else if (nextSpent >= b.limit * 0.8) {
          const toast: FinanceNotification = {
            id: 'toast-' + Date.now(),
            type: 'warning',
            message: `Warning: You just used ${Math.round((nextSpent / b.limit) * 100)}% of your ${finalCategory} budget.`,
            timestamp: new Date().toISOString(),
            read: false
          };
          setNotifications(prev => [toast, ...prev]);
        }
      }
    }
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const importBankStatement = (csvText: string) => {
    const lines = csvText.split('\n');
    const imported: Transaction[] = [];
    
    lines.forEach((line, index) => {
      if (index === 0 && (line.toLowerCase().includes('date') || line.toLowerCase().includes('description'))) {
        return; // Skip header
      }
      
      const parts = line.split(',');
      if (parts.length >= 3) {
        // Expected format: Date, Description, Amount, Type(optional)
        const date = parts[0]?.trim() || new Date().toISOString().split('T')[0];
        const desc = parts[1]?.trim() || 'Imported Transaction';
        const rawAmount = parseFloat(parts[2]?.trim() || '0');
        const typeStr = parts[3]?.trim().toLowerCase();
        
        let type: 'income' | 'expense' = 'expense';
        if (typeStr === 'income' || typeStr === 'credit' || rawAmount > 0) {
          type = 'income';
        }

        const amount = Math.abs(rawAmount);
        if (amount > 0) {
          imported.push({
            id: `import-${index}-${Date.now()}`,
            description: desc,
            amount,
            type,
            category: autoCategorize(desc),
            date,
            isSubscription: type === 'expense' && (desc.toLowerCase().includes('sub') || desc.toLowerCase().includes('netflix') || desc.toLowerCase().includes('spotify'))
          });
        }
      }
    });

    if (imported.length > 0) {
      setTransactions(prev => [...imported, ...prev]);
      
      const toast: FinanceNotification = {
        id: 'toast-import-' + Date.now(),
        type: 'success',
        message: `Successfully imported ${imported.length} transactions from statement.`,
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [toast, ...prev]);
    }
  };

  const updateBudgetLimit = (category: Budget['category'], limit: number) => {
    setBudgets(prev => prev.map(b => b.category === category ? { ...b, limit: Math.max(0, limit) } : b));
  };

  const toggleBillPaid = (id: string) => {
    setBills(prev => prev.map(b => {
      if (b.id === id) {
        const nextPaidState = !b.isPaid;
        // If it was marked as paid, record the payment as a transaction
        if (nextPaidState) {
          addTransaction(b.name, b.amount, 'expense', b.category as TransactionCategory);
        }
        return { ...b, isPaid: nextPaidState };
      }
      return b;
    }));
  };

  const addSavingsGoal = (name: string, target: number, deadline: string) => {
    const newGoal: SavingsGoal = {
      id: 'goal-' + Date.now(),
      name,
      targetAmount: target,
      currentAmount: 0,
      deadline,
      recommendedWeeklySavings: calculateRecommendedWeeklySavings(target, 0, deadline)
    };
    setSavingsGoals(prev => [...prev, newGoal]);
  };

  const updateSavingsProgress = (id: string, amount: number) => {
    setSavingsGoals(prev => prev.map(g => {
      if (g.id === id) {
        const nextAmt = Math.max(0, g.currentAmount + amount);
        // Create an expense for the savings allocation
        if (amount > 0) {
          addTransaction(`Savings Goal Contribution: ${g.name}`, amount, 'expense', 'Investments');
        }
        return { ...g, currentAmount: nextAmt };
      }
      return g;
    }));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Simulate Voice input like "I spent twelve dollars on lunch" or "Added fifty dollars for salary"
  const simulateVoiceInput = (speechText: string): string => {
    const phrase = speechText.toLowerCase();
    
    // Regex matches: "spent/spent twelve/12 dollars on lunch/uber"
    // Regex matches: "added/received fifty/50 dollars for salary"
    const amountRegex = /(\d+)(?:\s*dollars?|\s*\$)/i;
    const wordAmountMap: Record<string, number> = {
      one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
      eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, twenty: 20, thirty: 30,
      forty: 40, fifty: 50, hundred: 100
    };

    let amount = 0;
    const numMatch = phrase.match(amountRegex) || phrase.match(/\$\s*(\d+)/) || phrase.match(/(\d+)\s*bucks/);
    
    if (numMatch) {
      amount = parseFloat(numMatch[1]);
    } else {
      // Check word number matches
      for (const [word, val] of Object.entries(wordAmountMap)) {
        if (phrase.includes(word)) {
          amount = val;
          break;
        }
      }
    }

    if (amount <= 0) {
      return "Could not understand the transaction amount. Try saying 'Spent 15 dollars on Uber'.";
    }

    // Determine description and category
    let description = 'Voice transaction';
    let type: 'income' | 'expense' = 'expense';
    
    if (phrase.includes('salary') || phrase.includes('income') || phrase.includes('paycheck') || phrase.includes('received')) {
      type = 'income';
      description = 'Salary Paycheck';
    }

    // Capture target item/description
    // e.g. "on Uber" -> description "Uber"
    // e.g. "for Uber" -> description "Uber"
    const targetMatch = phrase.match(/(?:on|for|at|buy)\s+([a-zA-Z0-9\s]+)/);
    if (targetMatch && targetMatch[1]) {
      description = targetMatch[1].trim();
      // Capitalize first letter
      description = description.charAt(0).toUpperCase() + description.slice(1);
    }

    addTransaction(description, amount, type);
    return `Simulated transaction: Added ${type === 'income' ? 'Income' : 'Expense'} "${description}" of $${amount}.`;
  };

  // Simulate receipt scanning using mocked OCR texts
  const simulateReceiptScan = (receiptText: string) => {
    // Basic parser that looks for numbers and total fields
    const lines = receiptText.split('\n');
    let total = 0;
    let itemsCount = 0;
    let storeName = 'Receipt Store';

    // Parse store name from first non-empty line
    const nonBtn = lines.find(l => l.trim().length > 0);
    if (nonBtn) storeName = nonBtn.trim();

    lines.forEach(l => {
      const line = l.toLowerCase();
      if (line.includes('total') || line.includes('amount due') || line.includes('due:')) {
        const match = line.match(/(\d+\.\d{2})/);
        if (match) {
          total = parseFloat(match[1]);
        }
      }
      if (line.includes('$') || line.match(/\b\d+\.\d{2}\b/)) {
        itemsCount++;
      }
    });

    if (total === 0) {
      // Find maximum numeric value as fallback total
      let maxVal = 0;
      lines.forEach(l => {
        const match = l.match(/(\d+\.\d{2})/);
        if (match) {
          const val = parseFloat(match[1]);
          if (val > maxVal) maxVal = val;
        }
      });
      total = maxVal || 15.80; // default backup total
    }

    const category = autoCategorize(storeName);
    addTransaction(storeName, total, 'expense', category);

    return { itemsCount: Math.max(1, itemsCount - 1), total, category };
  };

  const resetAll = () => {
    localStorage.removeItem('bb_transactions');
    localStorage.removeItem('bb_budgets');
    localStorage.removeItem('bb_bills');
    localStorage.removeItem('bb_goals');
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setBills(INITIAL_BILLS);
    setSavingsGoals(INITIAL_GOALS);
    setActiveView('dashboard');
    
    const toast: FinanceNotification = {
      id: 'toast-reset-' + Date.now(),
      type: 'info',
      message: 'Reset data to default mock records.',
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications([toast]);
  };

  return (
    <FinanceContext.Provider value={{
      transactions,
      budgets,
      bills,
      savingsGoals,
      insights,
      healthScore,
      notifications,
      activeView,
      setActiveView,
      addTransaction,
      deleteTransaction,
      importBankStatement,
      updateBudgetLimit,
      toggleBillPaid,
      addSavingsGoal,
      updateSavingsProgress,
      markNotificationAsRead,
      simulateVoiceInput,
      simulateReceiptScan,
      resetAll
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};
