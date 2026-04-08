import { GetUser } from "@/app/types/users/users.type";
import { signalStore, withComputed, withState } from "@ngrx/signals";
import { addEntity, prependEntity, removeAllEntities, removeEntity, SelectEntityId, setAllEntities, withEntities } from "@ngrx/signals/entities";
import { Events, on, withEventHandlers, withReducer } from "@ngrx/signals/events";
import { UsersEvents } from "./users.events";
import { inject } from "@angular/core";
import { UsersService } from "@/app/services/users.service";
import { exhaustMap, from, map, tap } from "rxjs";
import { mapResponse } from "@ngrx/operators";
import { MatSnackBar } from "@angular/material/snack-bar";

type UserEntity = GetUser;

type UsersState = {
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  filters: {
    q?: string;
    status?: string;
  }
  loading: boolean;
  loadingForm: boolean;
  deleteLoading: boolean;
  currentDeleteUser: GetUser | null;
  error: string | null;
};

const selectId: SelectEntityId<UserEntity> = (user) => user.id;

const initialState: UsersState = {
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  filters: {
    q: undefined,
    status: undefined,
  },
  loading: false,
  loadingForm: false,
  deleteLoading: false,
  currentDeleteUser: null,
  error: null,
};

export const UsersStore = signalStore(
  { providedIn: "root" },
  withEntities<UserEntity>(),
  withState(initialState),
  withComputed(({ entities, entityMap }) => ({
    usersMap: entityMap,
    users: entities,
  })),
  withReducer(
    // Load users
    on(UsersEvents.loadUsers, (_, state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(UsersEvents.loadUsersSuccess, ({ payload }) => [
      setAllEntities(payload?.data ?? [], { selectId }),
      {
        pagination: { page: payload?.page ?? 1, limit: payload?.limit ?? 10, total: payload?.total ?? 0 },
        loading: false,
        error: null,
      },
    ]),
    on(UsersEvents.loadUsersFailure, (event, state) => ({
      ...state,
      loading: false,
      error: event.payload,
    })),

    // Create User
    on(UsersEvents.createUser, (_, state) => ({
      ...state,
      loadingForm: true,
      error: null,
    })),
    on(UsersEvents.createUserSuccess, ({ payload }) => [
      prependEntity(payload, { selectId }),
      {
        loadingForm: false,
        error: null,
      },
    ]),
    on(UsersEvents.createUserFailure, (event, state) => ({
      ...state,
      loadingForm: false,
      error: event.payload,
    })),

    // Delete user
    on(UsersEvents.deleteUser, ({ payload }) => [
      removeEntity(payload.user.id),
      { deleteLoading: true, currentDeleteUser: payload.user, error: null },
    ]),
    on(UsersEvents.deleteUserSuccess, ({ payload }) => [
      removeEntity(payload.user.id),
      { deleteLoading: false, error: null, currentDeleteUser: null },
    ]),
    on(UsersEvents.deleteUserFailure, (event, state) => (
      [
        addEntity(event.payload.user, { selectId }),
        { deleteLoading: false, error: event.payload.error, currentDeleteUser: null },
      ]
    )),

    // Others
    on(UsersEvents.resetStore, () => [removeAllEntities(), initialState]),
  ),

  withEventHandlers(
    (
      store,
      events = inject(Events),
      usersService = inject(UsersService),
      snackBar = inject(MatSnackBar)
    ) => ({
      loadUsers$: events.on(UsersEvents.loadUsers).pipe(
        exhaustMap(() =>
          from(
            usersService.getPaginatedUsers(
              store.pagination().page,
              store.pagination().limit
            )
          ).pipe(
            mapResponse({
              next: (response) => UsersEvents.loadUsersSuccess({
                data: response.data,
                total: response.total,
                page: response.page,
                limit: response.limit,
              }),
              error: (error: unknown) => UsersEvents.loadUsersFailure(error instanceof Error ? error.message : "Failed to load users"),
            })
          )
        )
      ),
      loadUsersFailure$: events.on(UsersEvents.loadUsersFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, "Close", { duration: 6000 });
          return {
            ...store,
            loading: false,
            error: payload,
          }
        })
      ),

      // Create user
      createUser$: events.on(UsersEvents.createUser).pipe(
        exhaustMap(({ payload }) =>
          from(usersService.createUser(payload.user)).pipe(
            mapResponse({
              next: (response) => UsersEvents.createUserSuccess(response),
              error: (error: unknown) => UsersEvents.createUserFailure(error instanceof Error ? error.message : "Failed to create user"),
            })
          )
        )
      ),
      createUserSuccess$: events.on(UsersEvents.createUserSuccess).pipe(
        tap(({ payload }) => {
          const userFullname = `${payload?.firstname} ${payload?.lastname}`;
          snackBar.open(`User ${userFullname} created successfully`, "Close", { duration: 6000 });
        })
      ),
      createUserFailure$: events.on(UsersEvents.createUserFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, "Close", { duration: 6000 });
          return {
            ...store,
            loading: false,
            error: payload,
          }
        })
      ),

      // Delete user
      deleteUser$: events.on(UsersEvents.deleteUser).pipe(
        exhaustMap(({ payload }) =>
          from(usersService.deleteUser(payload.user.id)).pipe(
            mapResponse({
              next: () => UsersEvents.deleteUserSuccess({ user: payload.user }),
              error: (error: unknown) => UsersEvents.deleteUserFailure({ error: error instanceof Error ? error.message : "Failed to delete user", user: payload.user }),
            })
          )
        )
      ),
      deleteUserSuccess$: events.on(UsersEvents.deleteUserSuccess).pipe(
        tap(() => {
          snackBar.open(`User deleted successfully`, "Close", { duration: 6000 });
        })
      ),
      deleteUserFailure$: events.on(UsersEvents.deleteUserFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload.error, "Close", { duration: 6000 });
          return {
            ...store,
            deleteLoading: false,
            error: payload.error,
            currentDeleteUser: null,
          }
        })
      ),
    })
  )
);