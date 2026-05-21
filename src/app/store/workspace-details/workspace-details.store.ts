import { GetWorkspace } from "@/app/types/workspaces/workspaces.types";
import { signalStore, withState } from "@ngrx/signals";
import { Events, on, withEventHandlers, withReducer } from "@ngrx/signals/events";
import { WorkspaceDetailsEvents } from "./workspace-details.events";
import { debounceTime, distinctUntilChanged, exhaustMap, filter, from, map, tap } from "rxjs";
import { WorkspacesService } from "@/app/services/workspaces.service";
import { inject } from "@angular/core";
import { mapResponse } from "@ngrx/operators";
import { MatSnackBar } from "@angular/material/snack-bar";
import { GetPaginatedUsers, GetUser } from "@/app/types/users/users.type";
import { ConfirmationDialogService } from "@/app/services/confirmation-dialog.service";
import { Router } from "@angular/router";
import { MAIN_WORKSPACES_PATH } from "@/app/constants/route.constant";
import { UsersService } from "@/app/services/users.service";
import { GroupsService } from "@/app/services/groups.service";
import { GetGroup } from "@/app/types/groups/groups.type";

type WorkspaceDetailsState = {
  workspace: GetWorkspace | null;
  users: GetUser[];
  searchedUsers: GetPaginatedUsers;
  groups: GetGroup[];
  loading: boolean;
  loadingUsers: boolean;
  loadingGroups: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  deletingWorkspaceUserLoading: boolean;
  searchUsersLoading: boolean;
  addWorkspaceUsersLoading: boolean;
  error: string | null;
};

const initialState: WorkspaceDetailsState = {
  workspace: null,
  users: [],
  searchedUsers: {
    data: [],
    total: 0,
    page: 1,
    limit: 15,
  },
  groups: [],
  loading: false,
  loadingUsers: false,
  loadingGroups: false,
  updateLoading: false,
  deleteLoading: false,
  deletingWorkspaceUserLoading: false,
  searchUsersLoading: false,
  addWorkspaceUsersLoading: false,
  error: null,
};

export const WorkspaceDetailsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withReducer(
    on(WorkspaceDetailsEvents.loadWorkspaceDetails, (_, state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(WorkspaceDetailsEvents.loadWorkspaceDetailsSuccess, ({ payload }, state) => ({
      ...state,
      workspace: payload.workspace,
      loading: false,
      error: null,
    })),
    on(WorkspaceDetailsEvents.loadWorkspaceDetailsFailure, (event, state) => ({
      ...state,
      loading: false,
      error: event.payload,
    })),

    on(WorkspaceDetailsEvents.loadWorkspaceUsers, (_, state) => ({
      ...state,
      loadingUsers: true,
      error: null,
    })),
    on(WorkspaceDetailsEvents.loadWorkspaceUsersSuccess, ({ payload }, state) => ({
      ...state,
      users: payload.users,
      loadingUsers: false,
      error: null,
    })),
    on(WorkspaceDetailsEvents.loadWorkspaceUsersFailure, (event, state) => ({
      ...state,
      loadingUsers: false,
      error: event.payload,
    })),

    on(WorkspaceDetailsEvents.loadWorkspaceGroups, (_, state) => ({
      ...state,
      loadingGroups: true,
      error: null,
    })),
    on(WorkspaceDetailsEvents.loadWorkspaceGroupsSuccess, ({ payload }, state) => ({
      ...state,
      groups: payload.groups,
      loadingGroups: false,
      error: null,
    })),
    on(WorkspaceDetailsEvents.loadWorkspaceGroupsFailure, (event, state) => ({
      ...state,
      loadingGroups: false,
      error: event.payload,
    })),

    on(WorkspaceDetailsEvents.removeWorkspaceUser, (_, state) => ({
      ...state,
      deletingWorkspaceUserLoading: true,
      error: null,
    })),
    on(WorkspaceDetailsEvents.removeWorkspaceUserSuccess, ({ payload }, state) => ({
      ...state,
      deletingWorkspaceUserLoading: false,
      users: state.users.filter((user) => user.id !== payload.userId),
    })),
    on(WorkspaceDetailsEvents.removeWorkspaceUserFailure, (event, state) => ({
      ...state,
      deletingWorkspaceUserLoading: false,
      error: event.payload,
    })),

    on(WorkspaceDetailsEvents.searchUsers, (_, state) => ({
      ...state,
      searchedUsers: {
        data: [],
        total: 0,
        page: 1,
        limit: 15,
      },
      searchUsersLoading: true,
      error: null,
    })),
    on(WorkspaceDetailsEvents.searchUsersSuccess, ({ payload }, state) => ({
      ...state,
      searchedUsers: payload,
      searchUsersLoading: false,
      error: null,
    })),
    on(WorkspaceDetailsEvents.searchUsersFailure, (event, state) => ({
      ...state,
      searchUsersLoading: false,
      error: event.payload,
    })),

    on(WorkspaceDetailsEvents.addWorkspaceUsers, (_, state) => ({
      ...state,
      addWorkspaceUsersLoading: true,
      error: null,
    })),
    on(WorkspaceDetailsEvents.addWorkspaceUsersSuccess, ({ payload }, state) => ({
      ...state,
      addWorkspaceUsersLoading: false,
      users: [...state.users, ...payload.users],
    })),
    on(WorkspaceDetailsEvents.addWorkspaceUsersFailure, (event, state) => ({
      ...state,
      addWorkspaceUsersLoading: false,
      error: event.payload,
    })),

    on(WorkspaceDetailsEvents.updateWorkspace, (_, state) => ({
      ...state,
      updateLoading: true,
      error: null,
    })),
    on(WorkspaceDetailsEvents.updateWorkspaceSuccess, ({ payload }, state) => ({
      ...state,
      workspace: payload.workspace,
      updateLoading: false,
      error: null,
    })),
    on(WorkspaceDetailsEvents.updateWorkspaceFailure, (event, state) => ({
      ...state,
      updateLoading: false,
      error: event.payload,
    })),

    on(WorkspaceDetailsEvents.deleteWorkspace, (_, state) => ({
      ...state,
      deleteLoading: true,
      error: null,
    })),
    on(WorkspaceDetailsEvents.deleteWorkspaceSuccess, (_, state) => ({
      ...state,
      deleteLoading: false,
      error: null,
    })),
    on(WorkspaceDetailsEvents.deleteWorkspaceFailure, (event, state) => ({
      ...state,
      deleteLoading: false,
      error: event.payload,
    })),
  ),

  withEventHandlers(
    (
      store,
      events = inject(Events),
      snackBar = inject(MatSnackBar),
      router = inject(Router),
      workspaceDetailsService = inject(WorkspacesService),
      usersService = inject(UsersService),
      groupsService = inject(GroupsService),
      confirmationDialogService = inject(ConfirmationDialogService),
    ) => ({
      loadWorkspaceDetails$: events.on(WorkspaceDetailsEvents.loadWorkspaceDetails).pipe(
        exhaustMap(({ payload }) => from(workspaceDetailsService.getWorkspaceById(payload.id)).pipe(
          mapResponse({
            next: (response) => WorkspaceDetailsEvents.loadWorkspaceDetailsSuccess({ workspace: response }),
            error: (error: unknown) => WorkspaceDetailsEvents.loadWorkspaceDetailsFailure(error instanceof Error ? error.message : 'Failed to load workspace details'),
          })
        ))
      ),
      loadWorkspaceDetailsFailure$: events.on(WorkspaceDetailsEvents.loadWorkspaceDetailsFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, "Close", { duration: 6000 });
        })
      ),

      loadWorkspaceUsers$: events.on(WorkspaceDetailsEvents.loadWorkspaceUsers).pipe(
        exhaustMap(({ payload }) => from(workspaceDetailsService.getWorkspaceUsers(payload.id)).pipe(
          mapResponse({
            next: (response) => WorkspaceDetailsEvents.loadWorkspaceUsersSuccess({ users: response }),
            error: (error: unknown) => WorkspaceDetailsEvents.loadWorkspaceUsersFailure(error instanceof Error ? error.message : 'Failed to load workspace users'),
          })
        ))
      ),
      loadWorkspaceUsersFailure$: events.on(WorkspaceDetailsEvents.loadWorkspaceUsersFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, "Close", { duration: 6000 });
        })
      ),

      loadWorkspaceGroups$: events.on(WorkspaceDetailsEvents.loadWorkspaceGroups).pipe(
        exhaustMap(({ payload }) => from(groupsService.getPaginatedGroups(1, 100, '', payload.id)).pipe(
          mapResponse({
            next: (response) => WorkspaceDetailsEvents.loadWorkspaceGroupsSuccess({ groups: response.data }),
            error: (error: unknown) => WorkspaceDetailsEvents.loadWorkspaceGroupsFailure(error instanceof Error ? error.message : 'Failed to load workspace groups'),
          })
        ))
      ),
      loadWorkspaceGroupsFailure$: events.on(WorkspaceDetailsEvents.loadWorkspaceGroupsFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, "Close", { duration: 6000 });
        })
      ),

      removeWorkspaceUser$: events.on(WorkspaceDetailsEvents.removeWorkspaceUser).pipe(
        exhaustMap(({ payload }) => {
          const userDisplayName =
            `${payload.user.firstname} ${payload.user.lastname}`.trim() || 'this user';
          return from(confirmationDialogService.confirm({
            title: 'Remove user from workspace',
            message: `Are you sure you want to remove <strong>${userDisplayName}</strong> from this workspace?`,
            positiveButtonText: 'Yes, remove',
            negativeButtonText: 'No, cancel',
          })).pipe(
            filter((result): result is true => result === true),
            exhaustMap(() =>
              from(usersService.updateUser(payload.user.id, { workspace_id: null })).pipe(
                mapResponse({
                  next: () => WorkspaceDetailsEvents.removeWorkspaceUserSuccess({ userId: payload.user.id }),
                  error: (error: unknown) =>
                    WorkspaceDetailsEvents.removeWorkspaceUserFailure(
                      error instanceof Error ? error.message : 'Failed to remove workspace user',
                    ),
                }),
              ),
            ),
          );
        }),
      ),
      removeWorkspaceUserSuccess$: events.on(WorkspaceDetailsEvents.removeWorkspaceUserSuccess).pipe(
        tap(() => {
          snackBar.open('Workspace user removed successfully', "Close", { duration: 6000 });
        })
      ),
      removeWorkspaceUserFailure$: events.on(WorkspaceDetailsEvents.removeWorkspaceUserFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, "Close", { duration: 6000 });
        })
      ),

      searchUsers$: events.on(WorkspaceDetailsEvents.searchUsers).pipe(
        debounceTime(500),
        exhaustMap(({ payload }) => from(usersService.getPaginatedUsers(1, 15, payload.q)).pipe(
          mapResponse({
            next: (response) => WorkspaceDetailsEvents.searchUsersSuccess(response),
            error: (error: unknown) => WorkspaceDetailsEvents.searchUsersFailure(error instanceof Error ? error.message : 'Failed to search users'),
          })
        ))
      ),
      searchUsersFailure$: events.on(WorkspaceDetailsEvents.searchUsersFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, "Close", { duration: 6000 });
        })
      ),

      addWorkspaceUsers$: events.on(WorkspaceDetailsEvents.addWorkspaceUsers).pipe(
        exhaustMap(({ payload }) => from(workspaceDetailsService.addWorkspaceUsers(store.workspace()?.id ?? '', payload.users)).pipe(
          mapResponse({
            next: (response) => WorkspaceDetailsEvents.addWorkspaceUsersSuccess({ users: response }),
            error: (error: unknown) => WorkspaceDetailsEvents.addWorkspaceUsersFailure(error instanceof Error ? error.message : 'Failed to add workspace users'),
          })
        ))
      ),
      addWorkspaceUsersSuccess$: events.on(WorkspaceDetailsEvents.addWorkspaceUsersSuccess).pipe(
        tap(() => {
          snackBar.open('Workspace users added successfully', "Close", { duration: 6000 });
        })
      ),
      addWorkspaceUsersFailure$: events.on(WorkspaceDetailsEvents.addWorkspaceUsersFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, "Close", { duration: 6000 });
        })
      ),

      updateWorkspace$: events.on(WorkspaceDetailsEvents.updateWorkspace).pipe(
        exhaustMap(({ payload }) =>
          from(workspaceDetailsService.patchWorkspace(payload.id, payload.workspace)).pipe(
            mapResponse({
              next: (response) => WorkspaceDetailsEvents.updateWorkspaceSuccess({ workspace: response }),
              error: (error: unknown) =>
                WorkspaceDetailsEvents.updateWorkspaceFailure(
                  error instanceof Error ? error.message : 'Failed to update workspace',
                ),
            }),
          ),
        ),
      ),
      updateWorkspaceSuccess$: events.on(WorkspaceDetailsEvents.updateWorkspaceSuccess).pipe(
        tap(({ payload }) => {
          snackBar.open(`Workspace ${payload.workspace.name} updated successfully`, "Close", { duration: 6000 });
        }),
      ),
      updateWorkspaceFailure$: events.on(WorkspaceDetailsEvents.updateWorkspaceFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, "Close", { duration: 6000 });
        }),
      ),

      deleteWorkspace$: events.on(WorkspaceDetailsEvents.deleteWorkspace).pipe(
        exhaustMap(({ payload }) =>
          from(confirmationDialogService.confirm({
            title: 'Delete workspace',
            message: `Are you sure you want to delete this workspace <strong>${payload.workspace.name}</strong>? This action will remove all users and groups from this workspace and cannot be undone.`,
            positiveButtonText: 'Yes, delete',
            negativeButtonText: 'No, cancel',
          })).pipe(
            filter((result): result is true => result === true),
            exhaustMap(() => from(workspaceDetailsService.deleteWorkspace(payload.workspace.id)).pipe(
              mapResponse({
                next: () => WorkspaceDetailsEvents.deleteWorkspaceSuccess(true),
                error: (error: unknown) => WorkspaceDetailsEvents.deleteWorkspaceFailure(error instanceof Error ? error.message : 'Failed to delete workspace'),
              })
            ))
          )
        )
      ),
      deleteWorkspaceSuccess$: events.on(WorkspaceDetailsEvents.deleteWorkspaceSuccess).pipe(
        tap(() => {
          snackBar.open('Workspace deleted successfully', "Close", { duration: 6000 });
          router.navigate([MAIN_WORKSPACES_PATH]);
        })
      ),
      deleteWorkspaceFailure$: events.on(WorkspaceDetailsEvents.deleteWorkspaceFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, "Close", { duration: 6000 });
        })
      ),
    }),
  )
);