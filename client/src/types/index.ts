export interface User {
  id: string;
  fullName: string;
  email: string;
  currency: string;
  monthlyIncome: number | null;
  monthlyBudget: number | null;
  profileType: string | null;
  onboarded: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface Income {
  id: string;
  userId: string;
  amount: number;
  categoryId: string;
  description: string | null;
  date: string;
  createdAt: string;
  category?: { id: string; name: string; icon: string; color: string };
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  categoryId: string;
  description: string | null;
  date: string;
  createdAt: string;
  category?: { id: string; name: string; icon: string; color: string };
  budgetWarning?: { severity: string; message: string; percentage: number } | null;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
  category?: { id: string; name: string; icon: string; color: string };
  spent?: number;
  percentage?: number;
  status?: "ok" | "warning" | "exceeded";
}

/** Normalized shape consumed by the transaction details drawer. */
export interface TxnDetail {
  id: string;
  type: "income" | "expense";
  amount: number;
  categoryId: string;
  category?: { name: string; icon?: string; color?: string };
  description?: string | null;
  date: string;
  createdAt?: string;
}

export interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  remainingBalance: number;
  savings: number;
  budgetStatus: { category: string; limit: number; spent: number; percentageUsed: number }[];
  recentTransactions: {
    id: string;
    type: "income" | "expense";
    amount: number;
    categoryId: string;
    category: { name: string; icon?: string; color?: string };
    description?: string | null;
    date: string;
    createdAt?: string;
  }[];
}

export interface AnalyticsData {
  expensePieChart: { category: string; amount: number; color: string }[];
  incomeVsExpense: { income: number; expense: number };
  monthlyTrend: { month: string; income: number; expense: number }[];
}
