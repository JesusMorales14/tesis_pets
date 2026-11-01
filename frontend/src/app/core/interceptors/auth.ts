import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }
  const auth = inject(AuthService);
  const router = inject(Router, { optional: true });
  const token = auth.token;

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthEndpoint =
        req.url.includes('/auth/login') || req.url.includes('/auth/register');

      if (error.status === 401 && !isAuthEndpoint) {
        auth.logout();
        if (router && !router.url.startsWith('/login') && !router.url.startsWith('/payment')) {
          router.navigate(['/login'], {
            state: {
              returnTo: router.url,
              expiredSession: true,
            },
          });
        }
      }
      return throwError(() => error);
    })
  );
};
