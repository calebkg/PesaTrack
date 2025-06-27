import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      map(isAuthenticated => {
        if (!isAuthenticated) {
          // Try to refresh token before redirecting
          const token = this.authService.getToken();
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (token && refreshToken) {
            this.authService.refreshToken().subscribe({
              next: () => {
                // Refresh successful, user is now authenticated
              },
              error: () => {
                // Refresh failed, redirect to login
                this.router.navigate(['/auth/login']);
              }
            });
            return false; // Wait for refresh result
          } else {
          this.router.navigate(['/auth/login']);
          return false;
          }
        }
        return true;
      }),
      catchError(() => {
        this.router.navigate(['/auth/login']);
        return of(false);
      })
    );
  }
}