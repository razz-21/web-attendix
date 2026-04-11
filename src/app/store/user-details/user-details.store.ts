import { GetUser, UserErrorResponse } from "@/app/types/users/users.type";
import { signalStore, withState } from "@ngrx/signals";
import { Events, on, withEventHandlers, withReducer } from "@ngrx/signals/events";
import { UserDetailsEvents } from "./user-details.events";
import { inject } from "@angular/core";
import { exhaustMap, from, lastValueFrom, map, pipe, tap } from "rxjs";
import { UsersService } from "@/app/services/users.service";
import { mapResponse } from "@ngrx/operators";
import { MatSnackBar } from "@angular/material/snack-bar";
import { HttpErrorResponse } from "@angular/common/http";

type UserDetailsState = {
  user: GetUser | null;
  loading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  error: UserErrorResponse | null;
};

const initialState: UserDetailsState = {
  user: null,
  loading: false,
  updateLoading: false,
  deleteLoading: false,
  error: null,
};

export const UserDetailsStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withReducer(
    on(UserDetailsEvents.loadUserDetails, (_, state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(UserDetailsEvents.loadUserDetailsSuccess, ({ payload }, state) => ({
      ...state,
      user: payload.user,
      loading: false,
      error: null,
    })),
    on(UserDetailsEvents.loadUserDetailsFailure, (event, state) => ({
      ...state,
      loading: false,
      error: event.payload,
    })),

    // Update user details
    on(UserDetailsEvents.updateUserDetails, (_, state) => ({
      ...state,
      updateLoading: true,
      error: null,
    })),
    on(UserDetailsEvents.updateUserDetailsSuccess, ({ payload }, state) => ({
      ...state,
      user: payload.user,
      updateLoading: false,
      error: null,
    })),
    on(UserDetailsEvents.updateUserDetailsFailure, (event, state) => ({
      ...state,
      updateLoading: false,
      error: event.payload,
    })),

    // Delete user
    on(UserDetailsEvents.deleteUser, (_, state) => ({
      ...state,
      deleteLoading: true,
      error: null,
    })),
    on(UserDetailsEvents.deleteUserSuccess, (_, state) => ({
      ...state,
      deleteLoading: false,
      error: null,
    })),
    on(UserDetailsEvents.deleteUserFailure, (event, state) => ({
      ...state,
      deleteLoading: false,
      error: event.payload,
    })),
  ),
  withEventHandlers(
    (
      store,
      events = inject(Events),
      userDetailsService = inject(UsersService),
      snackBar = inject(MatSnackBar),
    ) => ({
      // Load user details
      loadUserDetails$: events.on(UserDetailsEvents.loadUserDetails).pipe(
        exhaustMap(({ payload }) => from(userDetailsService.getUserById(payload.id))
        .pipe(
          mapResponse({
            next: (response) => UserDetailsEvents.loadUserDetailsSuccess({ user: response }),
            error: (error: unknown) => {
              const errorResponse = error as HttpErrorResponse;
              return UserDetailsEvents.loadUserDetailsFailure({
                status_code: errorResponse.status,
                message: errorResponse.error.message,
              });
            },
          })
        ))
      ),
      loadUserDetailsFailure$: events.on(UserDetailsEvents.loadUserDetailsFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload.message, "Close", { duration: 6000 });
        })
      ),
      
      // Update user details
      updateUserDetails$: events.on(UserDetailsEvents.updateUserDetails).pipe(
        exhaustMap(({ payload }) => from(userDetailsService.updateUser(store.user()?.id ?? '', payload.payload)).pipe(
          mapResponse({
            next: (response) => UserDetailsEvents.updateUserDetailsSuccess({ user: response }),
            error: (error: unknown) => {
              const errorResponse = error as HttpErrorResponse;
              return UserDetailsEvents.updateUserDetailsFailure({
                status_code: errorResponse.status,
                message: errorResponse.error.message,
              });
            },
          })
        ))
      ),
      updateUserDetailsSuccess$: events.on(UserDetailsEvents.updateUserDetailsSuccess).pipe(
        tap(() => {
          snackBar.open(`User updated successfully`, "Close", { duration: 6000 });
        })
      ),
      updateUserDetailsFailure$: events.on(UserDetailsEvents.updateUserDetailsFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload.message, "Close", { duration: 6000 });
        })
      ),

      // Delete user
      deleteUser$: events.on(UserDetailsEvents.deleteUser).pipe(
        exhaustMap(({ payload }) => from(userDetailsService.deleteUser(payload.user.id)).pipe(
          mapResponse({
            next: () => UserDetailsEvents.deleteUserSuccess(true),
            error: (error: unknown) => {
              const errorResponse = error as HttpErrorResponse;
              return UserDetailsEvents.deleteUserFailure({
                status_code: errorResponse.status,
                message: errorResponse.error.message,
              });
            },
          })
        ))
      ),
      deleteUserSuccess$: events.on(UserDetailsEvents.deleteUserSuccess).pipe(
        tap(() => {
          snackBar.open(`User deleted successfully`, "Close", { duration: 6000 });
        })
      ),
      deleteUserFailure$: events.on(UserDetailsEvents.deleteUserFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload.message, "Close", { duration: 6000 });
        })
      ),
    })
  )
);