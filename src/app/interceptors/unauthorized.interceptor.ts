import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AUTH_LOGIN_PATH, PUBLIC_ROUTES } from '@/app/constants/route.constant';
import { environment } from '@/environments/environment';
import { AuthEvents } from '@/app/store/auth/auth.events';
import { AuthStore } from '@/app/store/auth/auth.store';
import { Dispatcher } from '@ngrx/signals/events';
import { MatSnackBar } from '@angular/material/snack-bar';

const api = environment.apiBaseUrl;
const mePath = `${api}/api/v1/me`;

function isUnauthorizedSession(
  req: HttpRequest<unknown>,
  authStore: InstanceType<typeof AuthStore>,
): boolean {
  if (req.url.startsWith(mePath)) {
    return true;
  }
  return !!authStore.user() || !!authStore.access_token();
}

/**
 * When the API returns 401 for an authenticated or session-probing request,
 * clears auth state and sends the user to login. Skips failed login attempts.
 */
export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const dispatcher = inject(Dispatcher);
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      if (PUBLIC_ROUTES.some(route => req.url.startsWith(route))) {
        return throwError(() => error);
      }

      if (!isUnauthorizedSession(req, authStore)) {
        return throwError(() => error);
      }

      dispatcher.dispatch(AuthEvents.logoutSuccess());
      snackBar.open('Session expired. Please login again.', 'Close', { duration: 6000 });
      void router.navigate([AUTH_LOGIN_PATH]);

      return throwError(() => error);
    }),
  );
};
