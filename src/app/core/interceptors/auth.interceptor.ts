import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expired, try to refresh
          return authService.refreshToken().pipe(
            switchMap((response) => {
              // Retry the original request with the new token
              const newAuthReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${response.token}`)
              });
              return next(newAuthReq);
            }),
            catchError((refreshError) => {
              // Refresh failed, clear expired tokens
              authService.clearExpiredTokens();
              return throwError(() => refreshError);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};