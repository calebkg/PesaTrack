import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { CurrencyService } from '../../core/services/currency.service';
import { AuthService } from '../../core/services/auth.service';
import { Currency } from '../../core/models/currency.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-gray-700 to-gray-900 rounded-2xl p-6 text-white">
        <div class="flex items-center space-x-3">
          <span class="text-3xl">⚙️</span>
          <div>
            <h1 class="text-2xl font-bold mb-2">Settings</h1>
            <p class="text-gray-200">Customize your SPEMS experience</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Appearance Settings -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div class="flex items-center space-x-3 mb-6">
            <div class="p-2 bg-purple-100 rounded-lg">
              <span class="text-xl text-purple-600">🎨</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Appearance</h3>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <span class="text-xl">{{ isDarkMode ? '🌙' : '☀️' }}</span>
                <div>
                  <p class="font-medium text-gray-800 dark:text-white">Dark Mode</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
                </div>
              </div>
              <button
                (click)="toggleTheme()"
                [class]="'relative inline-flex h-6 w-11 items-center rounded-full transition-colors ' + (isDarkMode ? 'bg-blue-600' : 'bg-gray-200')"
              >
                <span
                  [class]="'inline-block h-4 w-4 transform rounded-full bg-white transition-transform ' + (isDarkMode ? 'translate-x-6' : 'translate-x-1')"
                ></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Currency Settings -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div class="flex items-center space-x-3 mb-6">
            <div class="p-2 bg-green-100 rounded-lg">
              <span class="text-xl text-green-600">🌍</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Currency & Region</h3>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Default Currency</label>
              <select 
                [(ngModel)]="selectedCurrency"
                (change)="changeCurrency()"
                class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option *ngFor="let currency of supportedCurrencies" [value]="currency.code">
                  {{ currency.flag }} {{ currency.name }} ({{ currency.code }})
                </option>
              </select>
            </div>

            <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p class="text-sm text-blue-600 dark:text-blue-400">
                <strong>Current:</strong> {{ currentCurrency.flag }} {{ currentCurrency.name }} ({{ currentCurrency.symbol }})
              </p>
            </div>

            <div *ngIf="isUpdatingCurrency" class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p class="text-sm text-yellow-600 dark:text-yellow-400">
                ⏳ Updating currency preference...
              </p>
            </div>

            <div *ngIf="currencyUpdateSuccess" class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p class="text-sm text-green-600 dark:text-green-400">
                ✅ Currency updated successfully!
              </p>
            </div>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div class="flex items-center space-x-3 mb-6">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <span class="text-xl text-yellow-600">🔔</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Notifications</h3>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-800 dark:text-white">Budget Alerts</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Get notified when approaching budget limits</p>
              </div>
              <button class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-blue-600">
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
              </button>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-800 dark:text-white">Monthly Reports</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Receive monthly spending summaries</p>
              </div>
              <button class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-blue-600">
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
              </button>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-800 dark:text-white">Expense Reminders</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Daily reminders to log expenses</p>
              </div>
              <button class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-gray-200 dark:bg-gray-600">
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Account Settings -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div class="flex items-center space-x-3 mb-6">
            <div class="p-2 bg-blue-100 rounded-lg">
              <span class="text-xl text-blue-600">👤</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Account</h3>
          </div>

          <div class="space-y-4">
            <button
              (click)="navigateToProfile()"
              class="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <span class="text-xl text-gray-600 dark:text-gray-400">👤</span>
                <div class="text-left">
                  <p class="font-medium text-gray-800 dark:text-white">Profile Settings</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Update your personal information</p>
                </div>
              </div>
              <span class="text-sm text-gray-500 dark:text-gray-400">→</span>
            </button>

            <div class="p-4 rounded-xl border border-gray-200 dark:border-gray-600">
              <div class="flex items-center space-x-3">
                <span class="text-xl text-green-600">🛡️</span>
                <div>
                  <p class="font-medium text-gray-800 dark:text-white">Account Security</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Your account is secure and verified</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Management -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 lg:col-span-2">
          <div class="flex items-center space-x-3 mb-6">
            <div class="p-2 bg-red-100 rounded-lg">
              <span class="text-xl text-red-600">💾</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Data Management</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 rounded-xl border border-gray-200 dark:border-gray-600">
              <div class="flex items-center space-x-3 mb-3">
                <span class="text-xl text-gray-600 dark:text-gray-400">❓</span>
                <p class="font-medium text-gray-800 dark:text-white">Data Storage</p>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Your data is stored securely in our database. Export regularly for backup.
              </p>
            </div>

            <div class="p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20">
              <div class="flex items-center space-x-3 mb-3">
                <span class="text-xl text-red-600">💾</span>
                <p class="font-medium text-gray-800 dark:text-white">Clear All Data</p>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Permanently delete all expenses, budgets, and settings.
              </p>
              <button class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                Clear Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  isDarkMode = false;
  currentCurrency: Currency = {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸'
  };
  selectedCurrency = 'USD';
  supportedCurrencies: Currency[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' }
  ];
  isUpdatingCurrency = false;
  currencyUpdateSuccess = false;
  currentUser: User | null = null;

  constructor(
    private themeService: ThemeService,
    private router: Router,
    private currencyService: CurrencyService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      if (user) {
        this.currentCurrency = this.currencyService.getCurrentCurrency();
        this.selectedCurrency = user.currency || 'USD';
      }
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  async changeCurrency() {
    if (!this.currentUser) return;

    this.isUpdatingCurrency = true;
    this.currencyUpdateSuccess = false;

    try {
      const newCurrency = this.supportedCurrencies.find(c => c.code === this.selectedCurrency);
      if (!newCurrency) return;

      // Update the currency service
      this.currencyService.setCurrentCurrency(newCurrency);
      this.currentCurrency = newCurrency;

      // Update user preference in backend
      await this.authService.updateProfile({
        currency: this.selectedCurrency
      }).toPromise();
      
      // Show success message
      this.currencyUpdateSuccess = true;
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        this.currencyUpdateSuccess = false;
      }, 3000);

    } catch (error) {
      console.error('Error updating currency:', error);
    } finally {
      this.isUpdatingCurrency = false;
    }
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }
}