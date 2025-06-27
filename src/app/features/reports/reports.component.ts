import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from 'src/app/core/services/expense.service';
import { BudgetService } from 'src/app/core/services/budget.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Expense } from 'src/app/core/models/expense.model';
import { Budget } from 'src/app/core/models/budget.model';
import { User } from 'src/app/core/models/user.model';

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  icon: string;
  color: string;
}

interface MonthlyData {
  month: string;
  amount: number;
  budget: number;
  count: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [CurrencyPipe],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold mb-2">Reports & Analytics</h1>
            <p class="text-purple-100">Visualize your spending patterns and budget performance</p>
          </div>
          <button 
            (click)="generateReport()"
            class="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-colors"
          >
            <span>📥</span>
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      <!-- Controls -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Select Month</label>
            <div class="flex items-center space-x-2">
              <span class="text-gray-400">📅</span>
              <input
                type="month"
                [(ngModel)]="selectedMonth"
                (change)="loadData()"
                class="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Report Type</label>
            <select
              [(ngModel)]="reportType"
              (change)="loadData()"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="both">Expenses & Budgets</option>
              <option value="expenses">Expenses Only</option>
              <option value="budgets">Budgets Only</option>
            </select>
          </div>

          <div class="flex items-end">
            <button 
              (click)="loadData()"
              class="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-colors"
            >
              <span>📄</span>
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div class="flex items-center space-x-3">
            <div class="p-3 bg-blue-100 rounded-xl">
              <span class="text-2xl text-blue-600">📈</span>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
              <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ totalSpent | currency:userCurrency }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div class="flex items-center space-x-3">
            <div class="p-3 bg-green-100 rounded-xl">
              <span class="text-2xl text-green-600">🎯</span>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Categories</p>
              <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ uniqueCategories }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div class="flex items-center space-x-3">
            <div class="p-3 bg-purple-100 rounded-xl">
              <span class="text-2xl text-purple-600">📊</span>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Transactions</p>
              <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ totalTransactions }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Spending by Category</h3>
          <div class="space-y-4">
            <div *ngFor="let category of categoryData" class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="p-2 rounded-lg" [ngClass]="category.color">
                  <span class="text-lg">{{ category.icon }}</span>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-800 dark:text-white">{{ category.category }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ category.count }} transactions</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ category.amount | currency:userCurrency }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ category.percentage.toFixed(1) }}%</p>
              </div>
            </div>
            
            <div *ngIf="categoryData.length === 0" class="text-center py-8">
              <div class="text-4xl mb-2">📊</div>
              <p class="text-gray-500 dark:text-gray-400">No data available for this period</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Budget vs Actual</h3>
          <div class="space-y-4">
            <div *ngFor="let budget of budgetComparison" class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ budget.category }}</span>
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ budget.spent | currency:userCurrency }} / {{ budget.amount | currency:userCurrency }}</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  class="h-2 rounded-full transition-all duration-300" 
                  [ngClass]="getProgressColor(budget.percentage)"
                  [style.width.%]="Math.min(budget.percentage, 100)"
                ></div>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ budget.percentage.toFixed(1) }}% used</p>
            </div>
            
            <div *ngIf="budgetComparison.length === 0" class="text-center py-8">
              <div class="text-4xl mb-2">🎯</div>
              <p class="text-gray-500 dark:text-gray-400">No budgets for this period</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Trend -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Monthly Spending Trend</h3>
        <div class="space-y-4">
          <div *ngFor="let month of monthlyTrend" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-blue-100 rounded-lg">
                <span class="text-blue-600">📅</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800 dark:text-white">{{ formatMonth(month.month) }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ month.count || 0 }} transactions</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ month.amount | currency:userCurrency }}</p>
              <p *ngIf="month.budget > 0" class="text-xs text-gray-500 dark:text-gray-400">Budget: {{ month.budget | currency:userCurrency }}</p>
            </div>
          </div>
          
          <div *ngIf="monthlyTrend.length === 0" class="text-center py-8">
            <div class="text-4xl mb-2">📈</div>
            <p class="text-gray-500 dark:text-gray-400">No spending data available</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  selectedMonth = new Date().toISOString().substring(0, 7);
  reportType = 'both';
  expenses: Expense[] = [];
  budgets: Budget[] = [];
  totalSpent = 0;
  totalTransactions = 0;
  uniqueCategories = 0;
  categoryData: CategoryData[] = [];
  budgetComparison: any[] = [];
  monthlyTrend: MonthlyData[] = [];
  userCurrency = 'USD';
  currentUser: User | null = null;
  Math = Math;

  constructor(
    private expenseService: ExpenseService,
    private budgetService: BudgetService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      this.userCurrency = user?.currency || 'USD';
      if (user) {
        this.loadData();
      }
    });
  }

  loadData(): void {
    // Load expenses for the selected month
    this.expenseService.getExpenses().subscribe((expenses: Expense[]) => {
      this.expenses = this.filterExpensesByMonth(expenses);
      this.calculateStats();
    });

    // Load budgets for the selected month
    this.budgetService.getBudgets().subscribe((budgets: Budget[]) => {
      this.budgets = this.filterBudgetsByMonth(budgets);
      this.calculateStats();
    });
  }

  filterExpensesByMonth(expenses: Expense[]): Expense[] {
    const [year, month] = this.selectedMonth.split('-');
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === parseInt(year) && 
             expenseDate.getMonth() + 1 === parseInt(month);
    });
  }

  filterBudgetsByMonth(budgets: Budget[]): Budget[] {
    return budgets.filter(budget => budget.month === this.selectedMonth);
  }

  calculateStats(): void {
    // Calculate totals
    this.totalSpent = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    this.totalTransactions = this.expenses.length;
    
    // Get unique categories
    const categories = new Set(this.expenses.map(e => e.category));
    this.uniqueCategories = categories.size;

    // Calculate category data
    this.calculateCategoryData();
    
    // Calculate budget comparison
    this.calculateBudgetComparison();
    
    // Calculate monthly trend
    this.calculateMonthlyTrend();
  }

  calculateCategoryData(): void {
    const categoryMap = new Map<string, { amount: number; count: number }>();
    
    this.expenses.forEach(expense => {
      const existing = categoryMap.get(expense.category) || { amount: 0, count: 0 };
      existing.amount += expense.amount;
      existing.count += 1;
      categoryMap.set(expense.category, existing);
    });

    this.categoryData = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: this.totalSpent > 0 ? (data.amount / this.totalSpent) * 100 : 0,
      count: data.count,
      icon: this.getCategoryIcon(category),
      color: this.getCategoryColor(category)
    })).sort((a, b) => b.amount - a.amount);
  }

  calculateBudgetComparison(): void {
    this.budgetComparison = this.budgets.map(budget => {
      const spent = this.expenses
        .filter(expense => expense.category === budget.category)
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        category: budget.category,
        amount: budget.amount,
        spent: spent,
        percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }

  calculateMonthlyTrend(): void {
    // Get last 6 months
    const months: MonthlyData[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().substring(0, 7);
      
      const monthExpenses = this.expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.toISOString().substring(0, 7) === monthStr;
      });
      
      const monthBudgets = this.budgets.filter(budget => budget.month === monthStr);
      
      months.push({
        month: monthStr,
        amount: monthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
        budget: monthBudgets.reduce((sum, budget) => sum + budget.amount, 0),
        count: monthExpenses.length
      });
    }
    
    this.monthlyTrend = months;
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

  formatMonth(monthString: string): string {
    if (!monthString) return '';
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  generateReport(): void {
    // This would generate a PDF report
    console.log('Generating PDF report...');
    alert('PDF export functionality would be implemented here');
  }
}