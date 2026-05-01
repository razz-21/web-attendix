import { GetWorkspace } from "@/app/types/workspaces/workspaces.types";
import { signalStore, withState } from "@ngrx/signals";
import { Events, on, withEventHandlers, withReducer } from "@ngrx/signals/events";
import { WorkspaceDetailsEvents } from "./workspace-details.events";
import { exhaustMap, filter, from, map, tap } from "rxjs";
import { WorkspacesService } from "@/app/services/workspaces.service";
import { inject } from "@angular/core";
import { mapResponse } from "@ngrx/operators";
import { MatSnackBar } from "@angular/material/snack-bar";
import { GetUser } from "@/app/types/users/users.type";
import { ConfirmationDialogService } from "@/app/services/confirmation-dialog.service";
import { Router } from "@angular/router";
import { MAIN_WORKSPACES_PATH } from "@/app/constants/route.constant";

type WorkspaceDetailsState = {
  workspace: GetWorkspace | null;
  users: GetUser[];
  loading: boolean;
  loadingUsers: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  error: string | null;
};

const initialState: WorkspaceDetailsState = {
  workspace: null,
  users: [],
  loading: false,
  loadingUsers: false,
  updateLoading: false,
  deleteLoading: false,
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