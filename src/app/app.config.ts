import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { authCredentialsInterceptor } from './interceptors/auth-credentials.interceptor';
import { unauthorizedInterceptor } from './interceptors/unauthorized.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatIconRegistry } from '@angular/material/icon';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authCredentialsInterceptor, unauthorizedInterceptor])),
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideRouter(routes),
    provideStore(),
    provideAppInitializer(() => {
      inject(MatIconRegistry).setDefaultFontSetClass(
        'material-symbols-outlined',
        'mat-ligature-font',
      );
    }),
  ],
};
