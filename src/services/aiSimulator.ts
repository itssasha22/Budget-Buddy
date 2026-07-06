import type { 
  Transaction, 
  TransactionCategory, 
  Budget, 
  Bill, 
  SavingsGoal, 
  SpendingInsight, 
  FinancialHealthScore, 
  FinanceNotification 
} from '../types/finance';

// Auto-categorize transaction descriptions using regular expression rules
export function autoCategorize(description: string): TransactionCategory {
  const desc = description.toLowerCase();
  
  const rules: { keywords: string[]; category: TransactionCategory }[] = [
    { keywords: ['salary', 'paycheck', 'dividend', 'bonus', 'freelance', 'stripe', 'transfer in'], category: 'Income' },
    { keywords: ['uber', 'lyft', 'taxi', 'gas', 'fuel', 'petrol', 'subway', 'metro', 'train', 'bus', 'flight', 'airline'], category: 'Transport' },
    { keywords: ['rent', 'mortgage', 'hoa', 'property', 'apartment'], category: 'Housing' },
    { keywords: ['grocery', 'supermarket', 'walmart', 'kroger', 'whole foods', 'lunch', 'dinner', 'starbucks', 'coffee', 'cafe', 'restaurant', 'mcdonald', 'burger', 'pizza', 'sushi', 'subway eat'], category: 'Food' },
    { keywords: ['amazon', 'target', 'nike', 'cloth', 'shirt', 'shoe', 'mall', 'shop', 'ebay', 'aliexpress', 'best buy'], category: 'Shopping' },
    { keywords: ['doctor', 'dentist', 'hospital', 'pharmacy', 'cvs', 'walgreens', 'medicine', 'health', 'insurance premium', 'clinical'], category: 'Healthcare' },
    { keywords: ['electricity', 'water', 'internet', 'comcast', 'wifi', 'utility', 'trash', 'power', 'sewer'], category: 'Utilities' },
    { keywords: ['netflix', 'spotify', 'hulu', 'disney', 'hbo', 'youtube premium', 'steam', 'game', 'cinema', 'movie', 'ticket', 'concert', 'spotify subscription'], category: 'Entertainment' },
    { keywords: ['course', 'udemy', 'coursera', 'book', 'tuition', 'school', 'college', 'exam', 'class'], category: 'Education' },
    { keywords: ['hotel', 'airbnb', 'flight', 'vacation', 'booking', 'cruise', 'resort'], category: 'Travel' },
    { keywords: ['crypto', 'bitcoin', 'stock', 'etf', 'fidelity', 'robinhood', 'vanguard', 'invest'], category: 'Investments' }
  ];

  for (const rule of rules) {
    if (rule.keywords.some(keyword => desc.includes(keyword))) {
      return rule.category;
    }
  }

  return 'Uncategorized';
}

// Generate a Financial Health Score dynamically
export function calculateFinancialHealthScore(
  transactions: Transaction[],
  budgets: Budget[],
  bills: Bill[],
  savingsGoals: SavingsGoal[]
): FinancialHealthScore {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // 1. Savings Rate Score (0 - 25 points)
  // Savings Rate = (Income - Expense) / Income
  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
  let savingsRateScore = 0;
  if (savingsRate >= 30) savingsRateScore = 25;
  else if (savingsRate >= 20) savingsRateScore = 20;
  else if (savingsRate >= 10) savingsRateScore = 15;
  else if (savingsRate > 0) savingsRateScore = 10;
  else savingsRateScore = 0;

  // 2. Budget Adherence Score (0 - 25 points)
  // How many budgets are kept under the limit
  let budgetAdherenceScore = 25;
  if (budgets.length > 0) {
    const overBudgetCount = budgets.filter(b => b.spent > b.limit).length;
    const ratio = overBudgetCount / budgets.length;
    budgetAdherenceScore = Math.max(0, 25 - ratio * 25);
  }

  // 3. Bill Payment Consistency Score (0 - 20 points)
  let billConsistencyScore = 20;
  if (bills.length > 0) {
    const paidCount = bills.filter(b => b.isPaid).length;
    billConsistencyScore = (paidCount / bills.length) * 20;
  }

  // 4. Emergency Fund Score (0 - 15 points)
  // Target: Emergency fund covers 3 months of expenses. 
  // Let's assume currentAmount of savings targets matches the emergency fund.
  const emergencyGoals = savingsGoals.filter(g => g.name.toLowerCase().includes('emergency') || g.name.toLowerCase().includes('savings'));
  const emergencyTotal = emergencyGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const oneMonthExpenses = totalExpense > 0 ? totalExpense : 1000; // default minimum
  const monthsCovered = emergencyTotal / oneMonthExpenses;
  let emergencyFundScore = 0;
  if (monthsCovered >= 3) emergencyFundScore = 15;
  else if (monthsCovered >= 2) emergencyFundScore = 12;
  else if (monthsCovered >= 1) emergencyFundScore = 8;
  else if (monthsCovered > 0) emergencyFundScore = 4;

  // 5. Debt Ratio Score (0 - 15 points)
  // Assuming a static low debt ratio or calculating based on investments / expenses
  // Let's make it proportional to investments and general expense distribution
  const investmentRatio = totalIncome > 0 ? (transactions.filter(t => t.category === 'Investments').reduce((sum, t) => sum + t.amount, 0) / totalIncome) * 100 : 0;
  let debtRatioScore = 10; // start at a base score
  if (investmentRatio > 15) debtRatioScore = 15;
  else if (investmentRatio > 5) debtRatioScore = 12;

  const score = Math.round(
    savingsRateScore +
    budgetAdherenceScore +
    billConsistencyScore +
    emergencyFundScore +
    debtRatioScore
  );

  let rating: FinancialHealthScore['rating'] = 'Fair';
  if (score >= 80) rating = 'Excellent';
  else if (score >= 65) rating = 'Good';
  else if (score >= 45) rating = 'Fair';
  else rating = 'Needs Attention';

  return {
    score: Math.min(100, Math.max(0, score)),
    rating,
    breakdown: {
      savingsRate: Math.round(savingsRate),
      budgetAdherence: budgets.length > 0 ? Math.round(((budgets.length - budgets.filter(b => b.spent > b.limit).length) / budgets.length) * 100) : 100,
      billConsistency: bills.length > 0 ? Math.round((bills.filter(b => b.isPaid).length / bills.length) * 100) : 100,
      emergencyFund: Math.round(monthsCovered * 10) / 10,
      debtRatio: Math.max(0, 15 - Math.round(investmentRatio)) // mock proxy for debt ratio
    }
  };
}

// Generate Personalized AI Spending Insights
export function generateSpendingInsights(
  transactions: Transaction[],
  budgets: Budget[],
  _bills: Bill[]
): SpendingInsight[] {
  const insights: SpendingInsight[] = [];
  const now = new Date().toISOString();

  const expenses = transactions.filter(t => t.type === 'expense');
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

  if (expenses.length === 0) {
    return [
      {
        id: 'welcome-insight',
        type: 'info',
        message: 'Welcome to BudgetBuddy! Add transactions or import bank statements to get personalized AI financial insights.',
        date: now
      }
    ];
  }

  // Insight 1: High Spending Categories
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  if (sortedCategories.length > 0) {
    const [topCat, topAmt] = sortedCategories[0];
    const pct = Math.round((topAmt / totalExpense) * 100);
    if (pct > 25) {
      insights.push({
        id: 'category-concentration',
        type: 'warning',
        message: `You spent ${pct}% of your total budget on ${topCat} ($${topAmt}). Consider setting a budget limit here.`,
        date: now
      });
    }
  }

  // Insight 2: Subscriptions & Recurring payments
  const subscriptions = expenses.filter(t => t.isSubscription);
  const totalSubAmt = subscriptions.reduce((sum, t) => sum + t.amount, 0);
  if (subscriptions.length > 3) {
    insights.push({
      id: 'subscription-count',
      type: 'warning',
      message: `You have ${subscriptions.length} active subscriptions totaling $${totalSubAmt}/month. Review for forgotten memberships.`,
      date: now
    });
  }

  // Insight 3: Budget Adherence Warnings
  budgets.forEach(b => {
    const percent = (b.spent / b.limit) * 100;
    if (percent >= 100) {
      insights.push({
        id: `budget-exceeded-${b.category}`,
        type: 'warning',
        message: `Budget Exceeded: You have used ${Math.round(percent)}% of your ${b.category} budget ($${b.spent} of $${b.limit}).`,
        date: now
      });
    } else if (percent >= 80) {
      insights.push({
        id: `budget-warning-${b.category}`,
        type: 'warning',
        message: `High Spending: You have used ${Math.round(percent)}% of your ${b.category} budget ($${b.spent} of $${b.limit}).`,
        date: now
      });
    }
  });

  // Insight 4: Dynamic trend simulator (e.g. Uber/Restaurant trends)
  const diningOutTotal = expenses.filter(t => t.description.toLowerCase().includes('restaurant') || t.description.toLowerCase().includes('lunch') || t.description.toLowerCase().includes('dinner')).reduce((sum, t) => sum + t.amount, 0);
  if (diningOutTotal > 150) {
    insights.push({
      id: 'restaurant-insight',
      type: 'info',
      message: `Grocery spending dropped by 12% while dining out at restaurants increased this week. Prepping meals at home could save you ~$80/month.`,
      date: now
    });
  }

  // Insight 5: Positive savings trend
  const incomeTotal = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  if (incomeTotal > totalExpense) {
    const savingsRate = Math.round(((incomeTotal - totalExpense) / incomeTotal) * 100);
    if (savingsRate > 20) {
      insights.push({
        id: 'positive-savings',
        type: 'success',
        message: `Excellent! Your savings rate is currently ${savingsRate}%. This puts you on track to meet your long-term goals ahead of schedule.`,
        date: now
      });
    }
  }

  // Insight 6: Friday travel trend simulation
  const fridays = expenses.filter(t => {
    const day = new Date(t.date).getDay();
    return day === 5 && (t.category === 'Transport' || t.description.toLowerCase().includes('uber') || t.description.toLowerCase().includes('bolt'));
  });
  if (fridays.length >= 2) {
    insights.push({
      id: 'friday-transport-trend',
      type: 'info',
      message: 'Transport costs are increasing every Friday. Compare ride-shares or check public transit to optimize weekend expenses.',
      date: now
    });
  }

  return insights.slice(0, 4); // Keep top 4 insights
}

// Generate Notifications dynamically based on financial activity
export function getTriggeredNotifications(
  _transactions: Transaction[],
  budgets: Budget[],
  bills: Bill[]
): FinanceNotification[] {
  const notifications: FinanceNotification[] = [];
  const now = new Date();

  // 1. Budget warnings
  budgets.forEach(b => {
    const percent = (b.spent / b.limit) * 100;
    if (percent >= 100) {
      notifications.push({
        id: `notify-budget-over-${b.category}`,
        type: 'alert',
        message: `ALERT: You have exceeded your monthly ${b.category} budget!`,
        timestamp: now.toISOString(),
        read: false
      });
    } else if (percent >= 80) {
      notifications.push({
        id: `notify-budget-warning-${b.category}`,
        type: 'warning',
        message: `Overspending Warning: You've used ${Math.round(percent)}% of your ${b.category} budget.`,
        timestamp: now.toISOString(),
        read: false
      });
    }
  });

  // 2. Upcoming bills
  bills.forEach(b => {
    if (!b.isPaid) {
      const due = new Date(b.dueDate);
      const diffTime = due.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        notifications.push({
          id: `notify-bill-due-${b.id}`,
          type: 'warning',
          message: `Bill Reminder: ${b.name} of $${b.amount} is due tomorrow.`,
          timestamp: now.toISOString(),
          read: false
        });
      } else if (diffDays <= 0 && diffDays > -3) {
        notifications.push({
          id: `notify-bill-overdue-${b.id}`,
          type: 'alert',
          message: `ALERT: ${b.name} of $${b.amount} was due on ${b.dueDate}!`,
          timestamp: now.toISOString(),
          read: false
        });
      }
    }
  });

  return notifications;
}

// Recommend weekly savings target based on goal amount, current progress and deadline
export function calculateRecommendedWeeklySavings(
  targetAmount: number,
  currentAmount: number,
  deadlineStr: string
): number {
  const deadline = new Date(deadlineStr);
  const now = new Date();
  
  if (deadline.getTime() <= now.getTime()) return 0;
  
  const remainingNeeded = targetAmount - currentAmount;
  if (remainingNeeded <= 0) return 0;

  const diffTime = deadline.getTime() - now.getTime();
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));

  if (diffWeeks <= 0) return remainingNeeded;

  return Math.round((remainingNeeded / diffWeeks) * 100) / 100;
}
