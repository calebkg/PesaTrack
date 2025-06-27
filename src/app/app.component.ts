import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      <div class="flex h-screen" *ngIf="authService.isAuthenticated$ | async; else authTemplate">
        <app-sidebar></app-sidebar>
        <div class="flex-1 overflow-hidden">
          <main class="h-full overflow-y-auto p-6">
            <div class="max-w-7xl mx-auto">
              <router-outlet></router-outlet>
            </div>
          </main>
        </div>
      </div>
      
      <ng-template #authTemplate>
        <router-outlet></router-outlet>
      </ng-template>
    </div>
  `
})
export class AppComponent implements OnInit {
  constructor(
    public authService: AuthService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.themeService.initializeTheme();
    this.authService.checkAuthStatus();
  }
}