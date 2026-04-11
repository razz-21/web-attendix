import { GetUser } from "@/app/types/users/users.type";
import { signalStore, withState } from "@ngrx/signals";
import { Events, on, withEventHandlers, withReducer } from "@ngrx/signals/events";
import { AuthEvents } from "./auth.events";
import { exhaustMap, from, tap } from "rxjs";
import { inject } from "@angular/core";
import { mapResponse } from "@ngrx/operators";
import { AuthService } from "@/app/services/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { HttpErrorResponse } from "@angular/common/http";
import { getHttpErrorMessage } from "@/app/utils/get-http-error-message";

interface AuthState {
  access_token: string | null;
  refresh_token: string | null;
  user: GetUser | null;
  loggingLoading: boolean;
  loggingoutLoading: boolean;
  loginError: string | null;
}

const initialState: AuthState = {
  access_token: null,
  refresh_token: null,
  user: null,
  loggingLoading: false,
  loggingoutLoading: false,
  loginError: null,
};

export const AuthStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withReducer(
    // Email Login
    on(AuthEvents.emailLogin, (_, state) => ({
      ...state,
      loggingLoading: true,
      loginError: null,
    })),
    on(AuthEvents.emailLoginSuccess, (_, state) => ({
      ...state,
      loggingLoading: false,
      loginError: null,
    })),
    on(AuthEvents.emailLoginFailure, (event, state) => ({
      ...state,
      loggingLoading: false,
      loginError: event.payload.message,
    })),

    // Logout
    on(AuthEvents.logout, (_, state) => ({
      ...state,
      loggingoutLoading: true,
    })),
    on(AuthEvents.logoutSuccess, (_, state) => ({
      ...state,
      access_token: null,
      refresh_token: null,
      user: null,
      loggingoutLoading: false,
    })),
    on(AuthEvents.logoutFailure, (event, state) => ({
      ...state,
      loggingoutLoading: false,
      error: event.payload,
    })),

    // Miscellaneous
    on(AuthEvents.setUser, ({ payload }, state) => ({
      ...state,
      user: payload.user,
    })),
  ),

  withEventHandlers(
    (
      store,
      events = inject(Events),
      authService = inject(AuthService),
      snackBar = inject(MatSnackBar),
    ) => ({
      emailLogin$: events.on(AuthEvents.emailLogin).pipe(
        exhaustMap(({ payload }) => from(authService.emailLogin({ email: payload.email, password: payload.password })).pipe(
          mapResponse({
            next: (response) => AuthEvents.emailLoginSuccess(response),
            error: (error: unknown) => {
              const errorResponse = error as HttpErrorResponse;
              const statusCode = errorResponse.status;
              const message =statusCode === 401 ? 'Invalid email or password' : getHttpErrorMessage(errorResponse);
              return AuthEvents.emailLoginFailure({
                status_code: errorResponse.status,
                message,
              });
            },
          })
        ))
      ),
      emailLoginFailure$: events.on(AuthEvents.emailLoginFailure).pipe(
        tap(({ payload }) => {
          if (payload.status_code !== 401) {
            snackBar.open(payload.message, "Close", { duration: 6000 });
          }
        })
      ),
    })
  )
);
