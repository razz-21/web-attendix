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
import { AuthErrorResponse } from "@/app/types/auth/auth.types";

interface AuthState {
  access_token: string | null;
  refresh_token: string | null;
  user: GetUser | null;
  loggingLoading: boolean;
  loggingoutLoading: boolean;
  loginError: AuthErrorResponse | null;
  updateProfileLoading: boolean;
  updateProfileError: AuthErrorResponse | null;
  updatePasswordLoading: boolean;
  updatePasswordError: AuthErrorResponse | null;
}

const initialState: AuthState = {
  access_token: null,
  refresh_token: null,
  user: null,
  loggingLoading: false,
  loggingoutLoading: false,
  loginError: null,
  updateProfileLoading: false,
  updateProfileError: null,
  updatePasswordLoading: false,
  updatePasswordError: null,
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
      loginError: event.payload,
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

    // Update profile
    on(AuthEvents.updateProfile, (_, state) => ({
      ...state,
      updateProfileLoading: true,
      updateProfileError: null,
    })),
    on(AuthEvents.updateProfileSuccess, ({ payload }, state) => ({
      ...state,
      user: { ...state.user, ...payload.user },
      updateProfileLoading: false,
      updateProfileError: null,
    })),
    on(AuthEvents.updateProfileFailure, (event, state) => ({
      ...state,
      updateProfileLoading: false,
      updateProfileError: event.payload,
    })),

    // Update password
    on(AuthEvents.updatePassword, (_, state) => ({
      ...state,
      updatePasswordLoading: true,
      updatePasswordError: null,
    })),
    on(AuthEvents.updatePasswordSuccess, (_, state) => ({
      ...state,
      updatePasswordLoading: false,
      updatePasswordError: null,
    })),
    on(AuthEvents.updatePasswordFailure, (event, state) => ({
      ...state,
      updatePasswordLoading: false,
      updatePasswordError: event.payload,
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
              const message = statusCode === 401 ? 'Invalid email or password' : getHttpErrorMessage(errorResponse);
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

      // Update profile
      updateProfile$: events.on(AuthEvents.updateProfile).pipe(
        exhaustMap(({ payload }) => from(authService.updateProfile(store.user()?.id ?? '', payload.payload)).pipe(
          mapResponse({
            next: (response) => AuthEvents.updateProfileSuccess({ user: response }),
            error: (error: unknown) => {
              const errorResponse = error as HttpErrorResponse;
              const message = getHttpErrorMessage(errorResponse);
              return AuthEvents.updateProfileFailure({
                status_code: errorResponse.status,
                message,
              });
            },
          })
        ))
      ),
      updateProfileSuccess$: events.on(AuthEvents.updateProfileSuccess).pipe(
        tap(() => {
          snackBar.open(`Profile updated successfully`, "Close", { duration: 6000 });
        })
      ),
      updateProfileFailure$: events.on(AuthEvents.updateProfileFailure).pipe(
        tap(({ payload }) => {
          snackBar.open(payload.message, "Close", { duration: 6000 });
        })
      ),

      // Update password
      updatePassword$: events.on(AuthEvents.updatePassword).pipe(
        exhaustMap(({ payload }) => from(authService.updatePassword(store.user()?.id ?? '', payload.payload)).pipe(
          mapResponse({
            next: (response) => AuthEvents.updatePasswordSuccess({ success: response.success }),
            error: (error: unknown) => {
              const errorResponse = error as HttpErrorResponse;
              const message = getHttpErrorMessage(errorResponse);
              return AuthEvents.updatePasswordFailure({
                status_code: errorResponse.status,
                message,
              });
            },
          })
        ))
      ),
      updatePasswordSuccess$: events.on(AuthEvents.updatePasswordSuccess).pipe(
        tap(() => {
          snackBar.open(`Password updated successfully`, "Close", { duration: 6000 });
        })
      ),
      updatePasswordFailure$: events.on(AuthEvents.updatePasswordFailure).pipe(
        tap(({ payload }) => {
          snackBar.open(payload.message, "Close", { duration: 6000 });
        })
      ),
    })
  )
);
