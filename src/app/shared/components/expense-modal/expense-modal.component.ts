import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Expense } from '../../../core/models/expense.model';
import { AuthService } from '../../../core/services/auth.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { User } from '../../../core/models/user.model';
import { Currency } from '../../../core/models/currency.model';

@Component({
  selector: 'app-expense-modal',
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
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
            {{ expense ? 'Edit' : 'Add' }} Expense
          </h2>
          <button (click)="closeModal()" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <span class="text-2xl text-gray-500 dark:text-gray-400">×</span>
          </button>
        </div>

        <!-- Form -->
        <form [formGroup]="expenseForm" (ngSubmit)="onSubmit()" class="mt-6 space-y-4">
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <input 
              id="description" 
              formControlName="description" 
              type="text" 
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Coffee with friends"
            >
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="amount" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
              <input 
                id="amount" 
                formControlName="amount" 
                type="number" 
                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              >
            </div>
            <div>
              <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select 
                id="category" 
                formControlName="category"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>Select a category</option>
                <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
              </select>
            </div>
          </div>
          
          <div>
            <label for="date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <input 
              id="date" 
              formControlName="date" 
              type="date"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
            >
          </div>

          <!-- Actions -->
          <div class="pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button 
              type="button" 
              (click)="closeModal()" 
              class="px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              [disabled]="expenseForm.invalid"
              class="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ExpenseModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() expense: Expense | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Expense>();

  expenseForm: FormGroup;
  categories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
    'Bills & Utilities', 'Healthcare', 'Travel', 'Education', 
    'Personal Care', 'Home & Garden', 'Gifts & Donations', 'Other'
  ];
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
  ) {
    this.expenseForm = this.fb.group({
      description: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      date: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
    });

    this.currencyService.currentCurrency$.subscribe((currency: Currency) => {
      this.currentCurrency = currency;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['expense'] && this.expense) {
      this.expenseForm.patchValue({
        ...this.expense,
        date: this.datePipe.transform(this.expense.date, 'yyyy-MM-dd')
      });
    }
  }

  closeModal(): void {
    this.close.emit();
    this.expenseForm.reset();
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      const expenseData: Expense = {
        id: this.expense?.id || '',
        description: this.expenseForm.value.description,
        amount: parseFloat(this.expenseForm.value.amount),
        category: this.expenseForm.value.category,
        date: this.expenseForm.value.date,
        currency: this.expense?.currency || this.currentCurrency.code,
        tags: this.expense?.tags || [],
        receipt: this.expense?.receipt || '',
        createdAt: this.expense?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: this.expense?.userId || this.currentUser?.id || ''
      };
      
      this.save.emit(expenseData);
    }
  }
} 