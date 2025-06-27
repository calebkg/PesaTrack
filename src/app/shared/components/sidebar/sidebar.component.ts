import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="w-64 h-full shadow-xl transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="p-6 border-b border-gray-100 dark:border-gray-700">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
            <span class="text-xl font-bold text-gray-900 dark:text-white">PesaTrack</span>
          </div>
          <p class="text-sm mt-1 text-gray-500 dark:text-gray-400">
            Expense Manager
          </p>
        </div>
        
        <!-- Navigation -->
        <nav class="flex-1 p-4 space-y-2">
          <a
            *ngFor="let item of menuItems"
            [routerLink]="item.route"
            routerLinkActive="bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105"
            class="w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white"
          >
            <i [class]="item.icon" class="mr-3 w-5 h-5"></i>
            <span class="font-medium">{{ item.label }}</span>
          </a>
        </nav>

        <!-- User Section -->
        <div class="p-4 border-t border-gray-100 dark:border-gray-700" *ngIf="currentUser">
          <div class="p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
            <div class="flex items-center space-x-3 mb-3">
              <div class="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                <span class="text-white font-semibold text-sm">
                  {{ currentUser.name.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium truncate text-gray-800 dark:text-white">
                  {{ currentUser.name }}
                </p>
                <p class="text-xs truncate text-gray-500 dark:text-gray-400">
                  {{ currentUser.email }}
                </p>
              </div>
            </div>
            
            <div class="flex space-x-2">
              <button
                (click)="navigateToProfile()"
                class="flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200"
              >
                <i class="w-4 h-4">👤</i>
                <span>Profile</span>
              </button>
              
              <button
                (click)="logout()"
                class="flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors bg-red-50 dark:bg-red-600 hover:bg-red-100 dark:hover:bg-red-700 text-red-600 dark:text-white"
              >
                <i class="w-4 h-4">🚪</i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SidebarComponent implements OnInit {
  currentUser: User | null = null;
  
  menuItems = [
    { route: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { route: '/expenses', label: 'Expenses', icon: '💳' },
    { route: '/budgets', label: 'Budgets', icon: '📊' },
    { route: '/reports', label: 'Reports', icon: '📈' },
    { route: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}