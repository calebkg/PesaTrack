export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  currency: string;
  spent: number;
  remaining: number;
  percentage: number;
  amountSpent: number;
  amountRemaining: number;
  progressPercentage: number;
  description?: string;
}

export interface CreateBudgetRequest {
  category: string;
  amount: number;
  month: string;
  currency: string;
}

export interface UpdateBudgetRequest {
  amount?: number;
  category?: string;
  month?: string;
  currency?: string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  budgetUtilization: number;
  categoryBreakdown: { [category: string]: BudgetCategoryData };
}

export interface BudgetCategoryData {
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'good' | 'warning' | 'over';
}