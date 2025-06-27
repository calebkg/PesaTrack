import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-colors">
      <div class="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <!-- Left Side - Branding -->
        <div class="text-center lg:text-left">
          <h1 class="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            PesaTrack
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Track your expenses, manage your budget, and achieve your financial goals with our comprehensive expense management system.
          </p>
          <div class="space-y-4 text-gray-600 dark:text-gray-400">
            <div class="flex items-center justify-center lg:justify-start space-x-3">
              <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Track expenses effortlessly</span>
            </div>
            <div class="flex items-center justify-center lg:justify-start space-x-3">
              <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Set and monitor budgets</span>
            </div>
            <div class="flex items-center justify-center lg:justify-start space-x-3">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Generate insightful reports</span>
            </div>
            <div class="flex items-center justify-center lg:justify-start space-x-3">
              <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Multi-currency support with live rates</span>
            </div>
          </div>
        </div>

        <!-- Right Side - Login Form -->
        <div class="w-full max-w-md mx-auto">
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 dark:bg-gray-800/80 dark:border-gray-700/20">
            <div class="text-center mb-8">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
              <p class="text-gray-600 dark:text-gray-300">Sign in to your PesaTrack account</p>
            </div>

            <div *ngIf="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {{ error }}
            </div>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📧</span>
                  <input
                    type="email"
                    formControlName="email"
                    class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔒</span>
                  <input
                    [type]="showPassword ? 'text' : 'password'"
                    formControlName="password"
                    class="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    (click)="togglePassword()"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {{ showPassword ? '🙈' : '👁️' }}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                [disabled]="isLoading || loginForm.invalid"
                class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <div *ngIf="isLoading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span *ngIf="!isLoading">🚀 Sign In</span>
                <span *ngIf="isLoading">Signing in...</span>
              </button>
            </form>

            <div class="mt-6 text-center">
              <div class="border-t border-gray-200 dark:border-gray-600 pt-4">
                <span class="text-sm text-gray-600 dark:text-gray-400">Don't have an account? </span>
                <a
                  routerLink="/auth/register"
                  class="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Sign up
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  error = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.error = error.error?.message || 'Login failed. Please try again.';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}