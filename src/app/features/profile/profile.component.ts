import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <h1 class="text-2xl font-bold mb-2">Profile Settings</h1>
        <p class="text-blue-100">Manage your account information and preferences</p>
      </div>

      <!-- Success/Error Messages -->
      <div *ngIf="successMessage" class="bg-green-50 border border-green-200 rounded-xl p-4 text-green-600">
        {{ successMessage }}
      </div>

      <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
        {{ errorMessage }}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Profile Information -->
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-800 dark:text-white">Personal Information</h2>
              <button
                *ngIf="!isEditing"
                (click)="startEditing()"
                class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>✏️</span>
                <span>Edit</span>
              </button>
            </div>

            <form *ngIf="isEditing; else viewMode" (ngSubmit)="saveProfile()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">👤</span>
                  <input
                    type="text"
                    [(ngModel)]="editForm.name"
                    name="name"
                    class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📧</span>
                  <input
                    type="email"
                    [(ngModel)]="editForm.email"
                    name="email"
                    class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div class="flex space-x-3 pt-4">
                <button
                  type="button"
                  (click)="cancelEditing()"
                  class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>❌</span>
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  [disabled]="isLoading"
                  class="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <div *ngIf="isLoading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span *ngIf="!isLoading">💾</span>
                  <span>{{ isLoading ? 'Saving...' : 'Save Changes' }}</span>
                </button>
              </div>
            </form>

            <ng-template #viewMode>
              <div class="space-y-4" *ngIf="currentUser">
                <div class="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div class="p-2 bg-blue-100 rounded-lg">
                    <span class="text-xl text-blue-600">👤</span>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                    <p class="font-medium text-gray-800 dark:text-white">{{ currentUser.name }}</p>
                  </div>
                </div>

                <div class="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div class="p-2 bg-green-100 rounded-lg">
                    <span class="text-xl text-green-600">📧</span>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                    <p class="font-medium text-gray-800 dark:text-white">{{ currentUser.email }}</p>
                  </div>
                </div>

                <div class="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div class="p-2 bg-purple-100 rounded-lg">
                    <span class="text-xl text-purple-600">📅</span>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                    <p class="font-medium text-gray-800 dark:text-white">{{ formatDate(currentUser.createdAt) }}</p>
                  </div>
                </div>

                <div class="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div class="p-2 bg-green-100 rounded-lg">
                    <span class="text-xl text-green-600">🛡️</span>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Account Status</p>
                    <div class="flex items-center space-x-2">
                      <p class="font-medium text-gray-800 dark:text-white">
                        {{ currentUser.isVerified ? 'Verified' : 'Pending Verification' }}
                      </p>
                      <div *ngIf="currentUser.isVerified" class="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </ng-template>
          </div>
        </div>

        <!-- Currency Settings -->
        <div class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div class="flex items-center space-x-2 mb-4">
              <span class="text-xl">🌍</span>
              <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Currency Settings</h3>
            </div>

            <div class="space-y-4">
              <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p class="text-sm text-blue-600 dark:text-blue-400 mb-2">Current Currency</p>
                <div class="flex items-center space-x-2">
                  <span class="text-2xl">🇺🇸</span>
                  <div>
                    <p class="font-semibold text-gray-800 dark:text-white">US Dollar</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">USD ($)</p>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Change Currency</label>
                <select class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
                  <option value="USD">🇺🇸 US Dollar (USD)</option>
                  <option value="EUR">🇪🇺 Euro (EUR)</option>
                  <option value="GBP">🇬🇧 British Pound (GBP)</option>
                  <option value="KES">🇰🇪 Kenyan Shilling (KES)</option>
                  <option value="JPY">🇯🇵 Japanese Yen (JPY)</option>
                </select>
              </div>

              <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p class="text-xs text-yellow-700 dark:text-yellow-400">
                  <strong>Note:</strong> Changing currency will convert all your expenses and budgets using live exchange rates.
                </p>
              </div>
            </div>
          </div>

          <!-- Account Stats -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Account Statistics</h3>
            <div class="space-y-3" *ngIf="currentUser">
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">Account Age</span>
                <span class="font-medium text-gray-800 dark:text-white">{{ getAccountAge() }} days</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">Status</span>
                <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  isEditing = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  
  editForm = {
    name: '',
    email: ''
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.editForm = {
          name: user.name,
          email: user.email
        };
      }
    });
  }

  startEditing() {
    this.isEditing = true;
    this.clearMessages();
  }

  cancelEditing() {
    this.isEditing = false;
    if (this.currentUser) {
      this.editForm = {
        name: this.currentUser.name,
        email: this.currentUser.email
      };
    }
    this.clearMessages();
  }

  saveProfile() {
    this.isLoading = true;
    this.clearMessages();

    this.authService.updateProfile(this.editForm).subscribe({
      next: () => {
        this.successMessage = 'Profile updated successfully!';
        this.isEditing = false;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to update profile. Please try again.';
        this.isLoading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getAccountAge(): number {
    if (!this.currentUser) return 0;
    const createdAt = new Date(this.currentUser.createdAt);
    const now = new Date();
    return Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  }

  private clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }
}