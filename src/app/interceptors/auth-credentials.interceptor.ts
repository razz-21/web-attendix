import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Sends cookies on cross-origin API requests (e.g. session after login).
 * Requires CORS: Access-Control-Allow-Credentials and a specific origin.
 */
export const authCredentialsInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.clone({ withCredentials: true }));
