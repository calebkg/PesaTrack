import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExpenseService } from 'src/app/core/services/expense.service';
import { BudgetService } from 'src/app/core/services/budget.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { Expense } from 'src/app/core/models/expense.model';
import { Budget } from 'src/app/core/models/budget.model';
import { User } from 'src/app/core/models/user.model';
import { Currency } from 'src/app/core/models/currency.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  providers: [CurrencyPipe],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <h1 class="text-2xl font-bold mb-2">Dashboard Overview</h1>
        <p class="text-blue-100">
          Track your expenses and stay on top of your financial goals
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <span class="text-2xl">💰</span>
            </div>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Spent</p>
            <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ totalSpent | currency:currentCurrency.code }}</p>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white">
              <span class="text-2xl">🎯</span>
            </div>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Budget</p>
            <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ totalBudget | currency:currentCurrency.code }}</p>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <span class="text-2xl">📊</span>
            </div>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Transactions</p>
            <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ totalTransactions }}</p>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <span class="text-2xl">📈</span>
            </div>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Categories</p>
            <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ uniqueCategories }}</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button routerLink="/expenses" class="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex flex-col items-center space-y-2">
            <span class="text-2xl">➕</span>
            <span class="text-sm font-medium">Add Expense</span>
          </button>
          
          <button routerLink="/budgets" class="p-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex flex-col items-center space-y-2">
            <span class="text-2xl">🎯</span>
            <span class="text-sm font-medium">Set Budget</span>
          </button>
          
          <button routerLink="/reports" class="p-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex flex-col items-center space-y-2">
            <span class="text-2xl">📄</span>
            <span class="text-sm font-medium">View Report</span>
          </button>
          
          <button routerLink="/settings" class="p-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex flex-col items-center space-y-2">
            <span class="text-2xl">⚙️</span>
            <span class="text-sm font-medium">Settings</span>
          </button>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Expenses</h3>
          <div class="space-y-3">
            <div *ngFor="let expense of recentExpenses" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div class="p-2 rounded-lg" [ngClass]="getCategoryColor(expense.category)">
                <span>{{ getCategoryIcon(expense.category) }}</span>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-800 dark:text-white">{{ expense.description }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ expense.category }} • {{ formatDate(expense.date) }}</p>
              </div>
              <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ expense.amount | currency:currentCurrency.code }}</p>
            </div>
            
            <div *ngIf="recentExpenses.length === 0" class="text-center py-8">
              <div class="text-4xl mb-2">💰</div>
              <p class="text-gray-500 dark:text-gray-400">No expenses yet</p>
              <button routerLink="/expenses" class="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Add your first expense
              </button>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Budget Overview</h3>
          <div class="space-y-4">
            <div *ngFor="let budget of activeBudgets" class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ budget.category }}</span>
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ budget.spent | currency:currentCurrency.code }} / {{ budget.amount | currency:currentCurrency.code }}</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div class="h-2 rounded-full transition-all duration-300" [ngClass]="getProgressColor(budget.percentage)" [style.width.%]="Math.min(budget.percentage, 100)"></div>
              </div>
            </div>
            
            <div *ngIf="activeBudgets.length === 0" class="text-center py-8">
              <div class="text-4xl mb-2">🎯</div>
              <p class="text-gray-500 dark:text-gray-400">No budgets set</p>
              <button routerLink="/budgets" class="mt-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
                Create your first budget
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  expenses: Expense[] = [];
  budgets: Budget[] = [];
  recentExpenses: Expense[] = [];
  activeBudgets: Budget[] = [];
  totalSpent = 0;
  totalBudget = 0;
  totalTransactions = 0;
  uniqueCategories = 0;
  currentCurrency: Currency = {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸'
  };
  currentUser: User | null = null;
  Math = Math;

  constructor(
    private expenseService: ExpenseService,
    private budgetService: BudgetService,
    private authService: AuthService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      if (user) {
        this.loadData();
      }
    });

    // Subscribe to currency changes
    this.currencyService.currentCurrency$.subscribe((currency: Currency) => {
      this.currentCurrency = currency;
    });
  }

  loadData(): void {
    // Load expenses
    this.expenseService.getExpenses().subscribe((expenses: Expense[]) => {
      this.expenses = expenses;
      this.calculateStats();
    });

    // Load budgets
    this.budgetService.getBudgets().subscribe((budgets: Budget[]) => {
      this.budgets = budgets;
      this.calculateStats();
    });
  }

  calculateStats(): void {
    // Calculate totals
    this.totalSpent = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    this.totalBudget = this.budgets.reduce((sum, budget) => sum + budget.amount, 0);
    this.totalTransactions = this.expenses.length;
    
    // Get unique categories
    const categories = new Set([
      ...this.expenses.map(e => e.category),
      ...this.budgets.map(b => b.category)
    ]);
    this.uniqueCategories = categories.size;

    // Get recent expenses (last 5)
    this.recentExpenses = this.expenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Get active budgets (current month)
    const currentMonth = new Date().toISOString().substring(0, 7);
    this.activeBudgets = this.budgets
      .filter(budget => budget.month === currentMonth)
      .slice(0, 5);
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Food & Dining': '🍔',
      'Transportation': '🚗',
      'Entertainment': '🎬',
      'Shopping': '🛍️',
      'Healthcare': '🏥',
      'Utilities': '⚡',
      'Education': '📚',
      'Travel': '✈️',
      'Other': '📦'
    };
    return icons[category] || '📦';
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Food & Dining': 'bg-red-100 text-red-600',
      'Transportation': 'bg-blue-100 text-blue-600',
      'Entertainment': 'bg-purple-100 text-purple-600',
      'Shopping': 'bg-pink-100 text-pink-600',
      'Healthcare': 'bg-green-100 text-green-600',
      'Utilities': 'bg-yellow-100 text-yellow-600',
      'Education': 'bg-indigo-100 text-indigo-600',
      'Travel': 'bg-orange-100 text-orange-600',
      'Other': 'bg-gray-100 text-gray-600'
    };
    return colors[category] || 'bg-gray-100 text-gray-600';
  }

  getProgressColor(percentage: number): string {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  }
}