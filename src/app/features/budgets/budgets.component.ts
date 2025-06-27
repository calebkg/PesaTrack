import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetService } from '../../core/services/budget.service';
import { AuthService } from '../../core/services/auth.service';
import { CurrencyService } from '../../core/services/currency.service';
import { Budget, CreateBudgetRequest, UpdateBudgetRequest } from '../../core/models/budget.model';
import { User } from '../../core/models/user.model';
import { Currency } from '../../core/models/currency.model';
import { BudgetModalComponent } from '../../shared/components/budget-modal/budget-modal.component';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, FormsModule, BudgetModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold mb-2">Budgets</h1>
            <p class="text-green-100">Set and track your spending limits</p>
          </div>
          <button
            (click)="openBudgetModal()"
            class="px-6 py-3 bg-white text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-colors flex items-center space-x-2"
          >
            <span class="text-xl">🎯</span>
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Category</label>
            <select
              [(ngModel)]="selectedCategory"
              (change)="filterBudgets()"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              (change)="filterBudgets()"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Status</label>
            <select
              [(ngModel)]="selectedStatus"
              (change)="filterBudgets()"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="under">Under Budget</option>
              <option value="over">Over Budget</option>
              <option value="near">Near Limit</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Total Budget</p>
              <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ totalBudget | currency:currentCurrency.code }}</p>
            </div>
            <div class="p-3 rounded-xl bg-green-100 text-green-600">
              <span class="text-2xl">🎯</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
              <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ totalSpent | currency:currentCurrency.code }}</p>
            </div>
            <div class="p-3 rounded-xl bg-blue-100 text-blue-600">
              <span class="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
              <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ remainingBudget | currency:currentCurrency.code }}</p>
            </div>
            <div class="p-3 rounded-xl bg-purple-100 text-purple-600">
              <span class="text-2xl">💎</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Progress</p>
              <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ overallProgress }}%</p>
            </div>
            <div class="p-3 rounded-xl bg-orange-100 text-orange-600">
              <span class="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Budgets List -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white">All Budgets</h3>
        </div>

        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <div *ngFor="let budget of filteredBudgets" class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-4">
                <div class="p-3 rounded-xl" [ngClass]="getCategoryColor(budget.category)">
                  <span class="text-2xl">{{ getCategoryIcon(budget.category) }}</span>
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-gray-800 dark:text-white">{{ budget.category }}</h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatMonth(budget.month) }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-4">
                <div class="text-right">
                  <p class="text-xl font-bold text-gray-800 dark:text-white">{{ budget.spent | currency:currentCurrency.code }} / {{ budget.amount | currency:currentCurrency.code }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ budget.percentage }}% used</p>
                </div>
                <div class="flex space-x-2">
                  <button
                    (click)="editBudget(budget)"
                    class="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                  >
                    ✏️
                </button>
                  <button
                    (click)="deleteBudget(budget.id)"
                    class="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    🗑️
                </button>
                </div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                <div
                  class="h-3 rounded-full transition-all duration-300"
                [ngClass]="getProgressColor(budget.percentage)" 
                [style.width.%]="Math.min(budget.percentage, 100)"
                ></div>
            </div>

            <!-- Status Indicator -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ budget.spent | currency:currentCurrency.code }} of {{ budget.amount | currency:currentCurrency.code }}
              </span>
              <span class="text-sm font-medium" [ngClass]="getStatusColor(budget.percentage)">
                {{ getStatusText(budget.percentage) }}
              </span>
            </div>
          </div>

          <div *ngIf="filteredBudgets.length === 0" class="p-12 text-center">
            <div class="text-6xl mb-4">🎯</div>
            <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-2">No budgets found</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your filters or create your first budget</p>
            <button
              (click)="openBudgetModal()"
              class="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              Set Budget
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Budget Modal -->
    <app-budget-modal
      [isOpen]="showBudgetModal"
      [budget]="editingBudget"
      (close)="closeBudgetModal()"
      (save)="onBudgetSaved($event)"
    ></app-budget-modal>
  `
})
export class BudgetsComponent implements OnInit {
  budgets: Budget[] = [];
  filteredBudgets: Budget[] = [];
  categories: string[] = [];
  selectedCategory = '';
  selectedMonth = '';
  selectedStatus = '';
  totalBudget = 0;
  totalSpent = 0;
  remainingBudget = 0;
  overallProgress = 0;
  showBudgetModal = false;
  editingBudget: Budget | null = null;
  currentUser: User | null = null;
  currentCurrency: Currency = {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸'
  };
  Math = Math;

  constructor(
    private budgetService: BudgetService,
    private authService: AuthService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      if (user) {
        this.loadBudgets();
      }
    });

    // Subscribe to currency changes
    this.currencyService.currentCurrency$.subscribe((currency: Currency) => {
      this.currentCurrency = currency;
    });
  }

  loadBudgets(): void {
    this.budgetService.getBudgets().subscribe((budgets: Budget[]) => {
      this.budgets = budgets;
      this.filteredBudgets = budgets;
      this.calculateStats();
      this.extractCategories();
    });
  }

  calculateStats(): void {
    this.totalBudget = this.budgets.reduce((sum, budget) => sum + budget.amount, 0);
    this.totalSpent = this.budgets.reduce((sum, budget) => sum + budget.spent, 0);
    this.remainingBudget = this.totalBudget - this.totalSpent;
    this.overallProgress = this.totalBudget > 0 ? Math.round((this.totalSpent / this.totalBudget) * 100) : 0;
  }

  extractCategories(): void {
    const categorySet = new Set(this.budgets.map(budget => budget.category));
    this.categories = Array.from(categorySet).sort();
  }

  filterBudgets(): void {
    let filtered = [...this.budgets];

    if (this.selectedCategory) {
      filtered = filtered.filter(budget => budget.category === this.selectedCategory);
    }

    if (this.selectedMonth) {
      filtered = filtered.filter(budget => budget.month === this.selectedMonth);
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(budget => {
        switch (this.selectedStatus) {
          case 'under':
            return budget.percentage < 75;
          case 'over':
            return budget.percentage > 100;
          case 'near':
            return budget.percentage >= 75 && budget.percentage <= 100;
          default:
            return true;
        }
      });
    }

    this.filteredBudgets = filtered;
  }

  openBudgetModal(): void {
    this.editingBudget = null;
    this.showBudgetModal = true;
  }

  editBudget(budget: Budget): void {
    this.editingBudget = { ...budget };
    this.showBudgetModal = true;
  }

  closeBudgetModal(): void {
    this.showBudgetModal = false;
    this.editingBudget = null;
  }

  onBudgetSaved(budget: Budget): void {
    if (budget.id) {
      // Update existing budget
      const updateRequest: UpdateBudgetRequest = {
        amount: budget.amount,
        category: budget.category,
        month: budget.month,
        currency: budget.currency
      };
      this.budgetService.updateBudget(budget.id, updateRequest).subscribe(() => {
        this.closeBudgetModal();
        this.loadBudgets();
      });
    } else {
      // Create new budget
      const createRequest: CreateBudgetRequest = {
        amount: budget.amount,
        category: budget.category,
        month: budget.month,
        currency: budget.currency
      };
      this.budgetService.createBudget(createRequest).subscribe(() => {
        this.closeBudgetModal();
        this.loadBudgets();
      });
    }
  }

  deleteBudget(id: string): void {
    if (confirm('Are you sure you want to delete this budget?')) {
      this.budgetService.deleteBudget(id).subscribe(() => {
        this.loadBudgets();
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

  getProgressColor(percentage: number): string {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  getStatusColor(percentage: number): string {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  }

  getStatusText(percentage: number): string {
    if (percentage >= 100) return 'Over Budget';
    if (percentage >= 75) return 'Near Limit';
    return 'On Track';
  }

  formatMonth(monthString: string): string {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }
}