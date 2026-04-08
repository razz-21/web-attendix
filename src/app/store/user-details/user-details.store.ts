import { GetUser } from "@/app/types/users/users.type";
import { signalStore, withState } from "@ngrx/signals";
import { Events, on, withEventHandlers, withReducer } from "@ngrx/signals/events";
import { UserDetailsEvents } from "./user-details.events";
import { inject } from "@angular/core";
import { exhaustMap, from, lastValueFrom, map, pipe, tap } from "rxjs";
import { UsersService } from "@/app/services/users.service";
import { mapResponse } from "@ngrx/operators";
import { MatSnackBar } from "@angular/material/snack-bar";

type UserDetailsState = {
  user: GetUser | null;
  loading: boolean;
  updateLoading: boolean;
  error: string | null;
};

const initialState: UserDetailsState = {
  user: null,
  loading: false,
  updateLoading: false,
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
  ),
  withEventHandlers(
    (
      store,
      events = inject(Events),
      userDetailsService = inject(UsersService),
      snackBar = inject(MatSnackBar),
    ) => ({
      loadUserDetails$: events.on(UserDetailsEvents.loadUserDetails).pipe(
        exhaustMap(({ payload }) => from(userDetailsService.getUserById(payload.id))
        .pipe(
          mapResponse({
            next: (response) => UserDetailsEvents.loadUserDetailsSuccess({ user: response }),
            error: (error: unknown) => UserDetailsEvents.loadUserDetailsFailure(error instanceof Error ? error.message : "Failed to load user details"),
          })
        ))
      ),
      loadUserDetailsFailure$: events.on(UserDetailsEvents.loadUserDetailsFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, "Close", { duration: 6000 });
        })
      ),
      
      updateUserDetails$: events.on(UserDetailsEvents.updateUserDetails).pipe(
        exhaustMap(({ payload }) => from(userDetailsService.updateUser(store.user()?.id ?? '', payload.payload)).pipe(
          mapResponse({
            next: (response) => UserDetailsEvents.updateUserDetailsSuccess({ user: response }),
            error: (error: unknown) => UserDetailsEvents.updateUserDetailsFailure(error instanceof Error ? error.message : "Failed to update user details"),
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
          snackBar.open(payload, "Close", { duration: 6000 });
        })
      ),
    })
  )
);