import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../core/services/expense.service';
import { AuthService } from '../../core/services/auth.service';
import { CurrencyService } from '../../core/services/currency.service';
import { Expense } from '../../core/models/expense.model';
import { User } from '../../core/models/user.model';
import { Currency } from '../../core/models/currency.model';
import { ExpenseModalComponent } from '../../shared/components/expense-modal/expense-modal.component';
import { UpdateExpenseRequest, CreateExpenseRequest } from '../../core/models/expense.model';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule, ExpenseModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold mb-2">Expenses</h1>
            <p class="text-blue-100">Track and manage your expenses</p>
          </div>
          <button
            (click)="openExpenseModal()"
            class="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-2"
          >
            <span class="text-xl">➕</span>
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Category</label>
            <select
              [(ngModel)]="selectedCategory"
              (change)="filterExpenses()"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Month</label>
            <input
              type="month"
              [(ngModel)]="selectedMonth"
              (change)="filterExpenses()"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
        </div>

          <div>
            <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Min Amount</label>
            <input
              type="number"
              [(ngModel)]="minAmount"
              (input)="filterExpenses()"
              placeholder="0"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Max Amount</label>
            <input
              type="number"
              [(ngModel)]="maxAmount"
              (input)="filterExpenses()"
              placeholder="∞"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ totalExpenses | currency:currentCurrency.code }}</p>
            </div>
            <div class="p-3 rounded-xl bg-blue-100 text-blue-600">
              <span class="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">This Month</p>
              <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ monthlyExpenses | currency:currentCurrency.code }}</p>
            </div>
            <div class="p-3 rounded-xl bg-green-100 text-green-600">
              <span class="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Average</p>
              <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ averageExpense | currency:currentCurrency.code }}</p>
            </div>
            <div class="p-3 rounded-xl bg-purple-100 text-purple-600">
              <span class="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Expenses List -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white">All Expenses</h3>
        </div>

        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <div *ngFor="let expense of filteredExpenses" class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="p-3 rounded-xl" [ngClass]="getCategoryColor(expense.category)">
                  <span class="text-2xl">{{ getCategoryIcon(expense.category) }}</span>
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-gray-800 dark:text-white">{{ expense.description }}</h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ expense.category }} • {{ formatDate(expense.date) }}</p>
                  <div *ngIf="expense.tags && expense.tags.length > 0" class="flex flex-wrap gap-1 mt-1">
                    <span *ngFor="let tag of expense.tags" class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-4">
                <div class="text-right">
                  <p class="text-xl font-bold text-gray-800 dark:text-white">{{ expense.amount | currency:currentCurrency.code }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ expense.currency }}</p>
                </div>
                <div class="flex space-x-2">
                  <button
                    (click)="editExpense(expense)"
                    class="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    (click)="deleteExpense(expense.id)"
                    class="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="filteredExpenses.length === 0" class="p-12 text-center">
            <div class="text-6xl mb-4">💰</div>
            <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-2">No expenses found</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your filters or add your first expense</p>
            <button
              (click)="openExpenseModal()"
              class="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Add Expense
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Expense Modal -->
    <app-expense-modal
      [isOpen]="showExpenseModal"
      [expense]="editingExpense"
      (close)="closeExpenseModal()"
      (save)="onExpenseSaved($event)"
    ></app-expense-modal>
  `
})
export class ExpensesComponent implements OnInit {
  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  categories: string[] = [];
  selectedCategory = '';
  selectedMonth = '';
  minAmount: number | null = null;
  maxAmount: number | null = null;
  totalExpenses = 0;
  monthlyExpenses = 0;
  averageExpense = 0;
  showExpenseModal = false;
  editingExpense: Expense | null = null;
  currentUser: User | null = null;
  currentCurrency: Currency = {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸'
  };

  constructor(
    private expenseService: ExpenseService,
    private authService: AuthService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      if (user) {
        this.loadExpenses();
      }
    });

    // Subscribe to currency changes
    this.currencyService.currentCurrency$.subscribe((currency: Currency) => {
      this.currentCurrency = currency;
    });
  }

  loadExpenses(): void {
    this.expenseService.getExpenses().subscribe((expenses: Expense[]) => {
      this.expenses = expenses;
      this.filteredExpenses = expenses;
      this.calculateStats();
      this.extractCategories();
    });
  }

  calculateStats(): void {
    this.totalExpenses = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const currentMonth = new Date().toISOString().substring(0, 7);
    this.monthlyExpenses = this.expenses
      .filter(expense => expense.date.startsWith(currentMonth))
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    this.averageExpense = this.expenses.length > 0 ? this.totalExpenses / this.expenses.length : 0;
  }

  extractCategories(): void {
    const categorySet = new Set(this.expenses.map(expense => expense.category));
    this.categories = Array.from(categorySet).sort();
  }

  filterExpenses(): void {
    let filtered = [...this.expenses];

    if (this.selectedCategory) {
      filtered = filtered.filter(expense => expense.category === this.selectedCategory);
    }

    if (this.selectedMonth) {
      filtered = filtered.filter(expense => expense.date.startsWith(this.selectedMonth));
    }

    if (this.minAmount !== null) {
      filtered = filtered.filter(expense => expense.amount >= this.minAmount!);
    }

    if (this.maxAmount !== null) {
      filtered = filtered.filter(expense => expense.amount <= this.maxAmount!);
    }

    this.filteredExpenses = filtered;
  }

  openExpenseModal(): void {
    this.editingExpense = null;
    this.showExpenseModal = true;
  }

  editExpense(expense: Expense): void {
    this.editingExpense = { ...expense };
    this.showExpenseModal = true;
  }

  closeExpenseModal(): void {
    this.showExpenseModal = false;
    this.editingExpense = null;
  }

  onExpenseSaved(expense: Expense): void {
    if (expense.id) {
      // Update existing expense
      const updateRequest: UpdateExpenseRequest = {
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        description: expense.description,
        currency: expense.currency,
        tags: expense.tags
      };
      this.expenseService.updateExpense(expense.id, updateRequest).subscribe(() => {
        this.closeExpenseModal();
        this.loadExpenses();
      });
    } else {
      // Create new expense
      const createRequest: CreateExpenseRequest = {
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        description: expense.description,
        currency: expense.currency,
        tags: expense.tags
      };
      this.expenseService.createExpense(createRequest).subscribe(() => {
        this.closeExpenseModal();
        this.loadExpenses();
      });
    }
  }

  deleteExpense(id: string): void {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(id).subscribe(() => {
        this.loadExpenses();
      });
    }
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}