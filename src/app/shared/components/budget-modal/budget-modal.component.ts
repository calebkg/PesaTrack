import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Budget } from '../../../core/models/budget.model';
import { AuthService } from '../../../core/services/auth.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { User } from '../../../core/models/user.model';
import { Currency } from '../../../core/models/currency.model';

@Component({
  selector: 'app-budget-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [DatePipe],
  template: `
    <div 
      *ngIf="isOpen" 
      class="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center"
      (click)="closeModal()"
    >
      <div 
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative transform transition-all"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white">
            {{ budget?.id ? 'Edit Budget' : 'Add New Budget' }}
          </h2>
          <button 
            (click)="closeModal()"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <span class="text-2xl">×</span>
          </button>
        </div>

        <!-- Form -->
        <form [formGroup]="budgetForm" (ngSubmit)="onSubmit()" class="mt-6 space-y-6">
          <!-- Amount -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount *
            </label>
            <input
              type="number"
              formControlName="amount"
              step="0.01"
              min="0"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              placeholder="Enter budget amount"
            />
            <div *ngIf="budgetForm.get('amount')?.invalid && budgetForm.get('amount')?.touched" class="text-red-500 text-sm mt-1">
              Please enter a valid amount
            </div>
          </div>

          <!-- Category -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <select
              formControlName="category"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            >
              <option value="">Select a category</option>
              <option value="Food & Dining">Food & Dining</option>
              <option value="Transportation">Transportation</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Utilities">Utilities</option>
              <option value="Education">Education</option>
              <option value="Travel">Travel</option>
              <option value="Other">Other</option>
            </select>
            <div *ngIf="budgetForm.get('category')?.invalid && budgetForm.get('category')?.touched" class="text-red-500 text-sm mt-1">
              Please select a category
            </div>
          </div>

          <!-- Period -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Month *
            </label>
            <input
              type="month"
              formControlName="month"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            />
            <div *ngIf="budgetForm.get('month')?.invalid && budgetForm.get('month')?.touched" class="text-red-500 text-sm mt-1">
              Please select a month
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              formControlName="description"
              rows="3"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors resize-none"
              placeholder="Enter budget description (optional)"
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="flex space-x-4 pt-4">
            <button
              type="button"
              (click)="closeModal()"
              class="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="budgetForm.invalid || isSubmitting"
              class="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span *ngIf="!isSubmitting">{{ budget?.id ? 'Update' : 'Create' }} Budget</span>
              <span *ngIf="isSubmitting">Saving...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class BudgetModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() budget: Budget | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Budget>();

  budgetForm!: FormGroup;
  isSubmitting = false;
  currentUser: User | null = null;
  currentCurrency: Currency = {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸'
  };

  constructor(
    private fb: FormBuilder, 
    private datePipe: DatePipe,
    private authService: AuthService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
    });

    this.currencyService.currentCurrency$.subscribe((currency: Currency) => {
      this.currentCurrency = currency;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['budget'] && this.budgetForm) {
      this.populateForm();
    }
  }

  initForm(): void {
    this.budgetForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      month: ['', Validators.required],
      description: ['']
    });
  }

  populateForm(): void {
    if (this.budget) {
      this.budgetForm.patchValue({
        amount: this.budget.amount,
        category: this.budget.category,
        month: this.budget.month,
        description: this.budget.description || ''
      });
    } else {
      this.budgetForm.reset();
    }
  }

  onSubmit(): void {
    if (this.budgetForm.valid) {
      this.isSubmitting = true;
      const formData = this.budgetForm.value;
      
      const budgetData: Budget = {
        id: this.budget?.id || '',
        amount: parseFloat(formData.amount),
        category: formData.category,
        month: formData.month,
        description: formData.description || '',
        currency: this.budget?.currency || this.currentCurrency.code,
        spent: this.budget?.spent || 0,
        remaining: this.budget?.remaining || parseFloat(formData.amount),
        percentage: this.budget?.percentage || 0,
        amountSpent: this.budget?.amountSpent || 0,
        amountRemaining: this.budget?.amountRemaining || parseFloat(formData.amount),
        progressPercentage: this.budget?.progressPercentage || 0,
        createdAt: this.budget?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: this.budget?.userId || this.currentUser?.id || ''
      };

      this.save.emit(budgetData);
      this.isSubmitting = false;
    }
  }

  closeModal(): void {
    this.close.emit();
  }
} 