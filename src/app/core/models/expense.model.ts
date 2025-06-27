export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  currency: string;
  tags?: string[];
  receipt?: string;
}

export interface CreateExpenseRequest {
  amount: number;
  category: string;
  date: string;
  description: string;
  currency: string;
  tags?: string[];
}

export interface UpdateExpenseRequest {
  amount?: number;
  category?: string;
  date?: string;
  description?: string;
  currency?: string;
  tags?: string[];
}

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
}

export interface ExpenseSummary {
  totalExpenses: number;
  totalAmount: number;
  categoryBreakdown: { [category: string]: number };
  monthlyTrend: { month: string; amount: number }[];
}