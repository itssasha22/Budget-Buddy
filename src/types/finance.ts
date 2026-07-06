export type TransactionCategory =
  | 'Food'
  | 'Transport'
  | 'Housing'
  | 'Shopping'
  | 'Healthcare'
  | 'Utilities'
  | 'Entertainment'
  | 'Education'
  | 'Travel'
  | 'Investments'
  | 'Income'
  | 'Uncategorized';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: TransactionCategory;
  date: string;
  isSubscription?: boolean;
}

export interface Budget {
  category: Exclude<TransactionCategory, 'Income' | 'Uncategorized'>;
  limit: number;
  spent: number;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isPaid: boolean;
  recurring: 'monthly' | 'yearly' | 'weekly' | 'none';
}

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  category: TransactionCategory;
  isForgotten?: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  recommendedWeeklySavings: number;
}

export interface SpendingInsight {
  id: string;
  type: 'info' | 'warning' | 'success';
  message: string;
  date: string;
}

export interface FinancialHealthScore {
  score: number;
  rating: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  breakdown: {
    savingsRate: number;
    budgetAdherence: number;
    billConsistency: number;
    emergencyFund: number;
    debtRatio: number;
  };
}

export interface FinanceNotification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'alert';
  message: string;
  timestamp: string;
  read: boolean;
}
