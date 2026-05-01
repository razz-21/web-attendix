import type { GetWorkspace, Workspace } from '@/app/types/workspaces/workspaces.types';
import { signalStore, withComputed, withState } from '@ngrx/signals';
import {
  addEntities,
  addEntity,
  prependEntity,
  removeAllEntities,
  removeEntity,
  SelectEntityId,
  setAllEntities,
  upsertEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { Events, on, withEventHandlers, withReducer } from '@ngrx/signals/events';
import { computed, inject } from '@angular/core';
import { WorkspacesEvents } from './workspaces.events';
import { WorkspacesService } from '@/app/services/workspaces.service';
import { debounceTime, distinctUntilChanged, exhaustMap, from, map, tap } from 'rxjs';
import { mapResponse } from '@ngrx/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

type WorkspaceEntity = GetWorkspace;

type WorkspacesState = {
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  filters: {
    q?: string;
  };
  loading: boolean;
  loadingMore: boolean;
  loadingForm: boolean;
  deleteLoading: boolean;
  currentDeleteWorkspace: Workspace | null;
  error: string | null;
};

const selectId: SelectEntityId<WorkspaceEntity> = (workspace) => workspace.id;

const initialPagination: WorkspacesState['pagination'] = {
  page: 1,
  limit: 10,
  total: 0,
};

const initialState: WorkspacesState = {
  pagination: { ...initialPagination },
  filters: { q: undefined },
  loading: false,
  loadingMore: false,
  loadingForm: false,
  deleteLoading: false,
  currentDeleteWorkspace: null,
  error: null,
};

export const WorkspacesStore = signalStore(
  { providedIn: 'root' },
  withEntities<WorkspaceEntity>(),
  withState(initialState),
  withComputed(({ entities, entityMap, filters, pagination }) => ({
    workspacesMap: entityMap,
    workspaces: entities,
    hasMoreWorkspaces: computed(() => pagination().page * pagination().limit < pagination().total),
    hasWorkspaces: computed(() => !!entities().length),
    hasFilters: computed(() => !!filters().q),
  })),
  withReducer(
    on(WorkspacesEvents.loadWorkspaces, (_, state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(WorkspacesEvents.loadWorkspacesSuccess, ({ payload }) => [
      setAllEntities(payload?.data ?? [], { selectId }),
      {
        pagination: {
          page: payload?.page ?? 1,
          limit: payload?.limit ?? 10,
          total: payload?.total ?? 0,
        },
        loading: false,
        error: null,
      },
    ]),
    on(WorkspacesEvents.loadWorkspacesFailure, (event, state) => ({
      ...state,
      loading: false,
      error: event.payload,
    })),

    on(WorkspacesEvents.loadMoreWorkspaces, (_, state) => ({
      ...state,
      loadingMore: true,
      error: null,
    })),
    on(WorkspacesEvents.loadMoreWorkspacesSuccess, ({ payload }, state) => [
      addEntities(payload?.data ?? [], { selectId }),
      {
        loadingMore: false,
        error: null,
        pagination: { 
          page: payload?.page ?? 1,
          limit: payload?.limit ?? 10,
          total: payload?.total ?? 0,
        },
      },
    ]),
    on(WorkspacesEvents.loadMoreWorkspacesFailure, (event, state) => ({
      ...state,
      pagination: { 
        page: state.pagination.page - 1,
        limit: state.pagination.limit,
        total: state.pagination.total,
      },
      loadingMore: false,
      error: event.payload,
    })),

    on(WorkspacesEvents.searchWorkspaces, ({ payload }, state) => ({
      ...state,
      filters: { ...state.filters, q: payload.q },
      loading: true,
      error: null,
    })),
    on(WorkspacesEvents.searchWorkspacesSuccess, ({ payload }) => [
      setAllEntities(payload?.data ?? [], { selectId }),
      {
        pagination: {
          page: payload?.page ?? 1,
          limit: payload?.limit ?? 10,
          total: payload?.total ?? 0,
        },
        loading: false,
        error: null,
      },
    ]),
    on(WorkspacesEvents.searchWorkspacesFailure, (event, state) => ({
      ...state,
      loading: false,
      error: event.payload,
    })),

    on(WorkspacesEvents.createWorkspace, (_, state) => ({
      ...state,
      loadingForm: true,
      error: null,
    })),
    on(WorkspacesEvents.createWorkspaceSuccess, ({ payload }) => [
      prependEntity(payload, { selectId }),
      {
        loadingForm: false,
        error: null,
      },
    ]),
    on(WorkspacesEvents.createWorkspaceFailure, (event, state) => ({
      ...state,
      loadingForm: false,
      error: event.payload,
    })),

    on(WorkspacesEvents.updateWorkspace, (_, state) => ({
      ...state,
      loadingForm: true,
      error: null,
    })),
    on(WorkspacesEvents.updateWorkspaceSuccess, ({ payload }) => [
      upsertEntity(payload, { selectId }),
      {
        loadingForm: false,
        error: null,
      },
    ]),
    on(WorkspacesEvents.updateWorkspaceFailure, (event, state) => ({
      ...state,
      loadingForm: false,
      error: event.payload,
    })),

    on(WorkspacesEvents.deleteWorkspace, ({ payload }) => [
      removeEntity(payload.workspace.id),
      {
        deleteLoading: true,
        currentDeleteWorkspace: payload.workspace,
        error: null,
      },
    ]),
    on(WorkspacesEvents.deleteWorkspaceSuccess, ({ payload }) => [
      removeEntity(payload.workspace.id),
      { deleteLoading: false, error: null, currentDeleteWorkspace: null },
    ]),
    on(WorkspacesEvents.deleteWorkspaceFailure, (event) => [
      addEntity(event.payload.workspace, { selectId }),
      {
        deleteLoading: false,
        error: event.payload.error,
        currentDeleteWorkspace: null,
      },
    ]),

    on(WorkspacesEvents.resetStore, () => [removeAllEntities(), initialState]),
  ),

  withEventHandlers(
    (
      store,
      events = inject(Events),
      workspacesService = inject(WorkspacesService),
      snackBar = inject(MatSnackBar),
    ) => ({
      loadWorkspaces$: events.on(WorkspacesEvents.loadWorkspaces).pipe(
        exhaustMap(() =>
          from(
            workspacesService.getWorkspaces({
              page: store.pagination().page,
              limit: store.pagination().limit,
              q: store.filters().q,
            }),
          ).pipe(
            mapResponse({
              next: (response) =>
                WorkspacesEvents.loadWorkspacesSuccess({
                  data: response.data,
                  total: response.total,
                  page: response.page,
                  limit: response.limit,
                }),
              error: (error: unknown) =>
                WorkspacesEvents.loadWorkspacesFailure(
                  error instanceof Error ? error.message : 'Failed to load workspaces',
                ),
            }),
          ),
        ),
      ),
      loadWorkspacesFailure$: events.on(WorkspacesEvents.loadWorkspacesFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, 'Close', { duration: 6000 });
        }),
      ),

      loadMoreWorkspaces$: events.on(WorkspacesEvents.loadMoreWorkspaces).pipe(
        exhaustMap(() =>
          from(
            workspacesService.getWorkspaces({
              page: store.pagination().page + 1,
              limit: store.pagination().limit,
              q: store.filters().q,
            }),
          ).pipe(
            mapResponse({
              next: (response) =>
                WorkspacesEvents.loadMoreWorkspacesSuccess({
                  data: response.data,
                  total: response.total,
                  page: response.page,
                  limit: response.limit,
                }),
              error: (error: unknown) =>
                WorkspacesEvents.loadMoreWorkspacesFailure(
                  error instanceof Error ? error.message : 'Failed to load more workspaces',
                ),
            }),
          ),
        ),
      ),
      loadMoreWorkspacesSuccess$: events.on(WorkspacesEvents.loadMoreWorkspacesSuccess).pipe(
        map(() => undefined),
      ),
      loadMoreWorkspacesFailure$: events.on(WorkspacesEvents.loadMoreWorkspacesFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, 'Close', { duration: 6000 });
        }),
      ),

      searchWorkspaces$: events.on(WorkspacesEvents.searchWorkspaces).pipe(
        distinctUntilChanged((prev, curr) => prev.payload.q === curr.payload.q),
        debounceTime(500),
        exhaustMap(() =>
          from(
            workspacesService.getWorkspaces({
              ...initialPagination,
              q: store.filters().q,
            }),
          ).pipe(
            mapResponse({
              next: (response) => WorkspacesEvents.searchWorkspacesSuccess(response),
              error: (error: unknown) =>
                WorkspacesEvents.searchWorkspacesFailure(
                  error instanceof Error ? error.message : 'Failed to search workspaces',
                ),
            }),
          ),
        ),
      ),
      searchWorkspacesFailure$: events.on(WorkspacesEvents.searchWorkspacesFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, 'Close', { duration: 6000 });
        }),
      ),

      createWorkspace$: events.on(WorkspacesEvents.createWorkspace).pipe(
        exhaustMap(({ payload }) =>
          from(workspacesService.createWorkspace(payload.workspace)).pipe(
            mapResponse({
              next: (response) => WorkspacesEvents.createWorkspaceSuccess(response),
              error: (error: unknown) =>
                WorkspacesEvents.createWorkspaceFailure(
                  error instanceof Error ? error.message : 'Failed to create workspace',
                ),
            }),
          ),
        ),
      ),
      createWorkspaceSuccess$: events.on(WorkspacesEvents.createWorkspaceSuccess).pipe(
        tap(({ payload }) => {
          const workspaceName = payload?.name ?? 'Workspace';
          snackBar.open(`${workspaceName} created successfully`, 'Close', {
            duration: 6000,
          });
        }),
      ),
      createWorkspaceFailure$: events.on(WorkspacesEvents.createWorkspaceFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, 'Close', { duration: 6000 });
        }),
      ),

      updateWorkspace$: events.on(WorkspacesEvents.updateWorkspace).pipe(
        exhaustMap(({ payload }) =>
          from(workspacesService.patchWorkspace(payload.id, payload.workspace)).pipe(
            mapResponse({
              next: (response) => WorkspacesEvents.updateWorkspaceSuccess(response),
              error: (error: unknown) =>
                WorkspacesEvents.updateWorkspaceFailure(
                  error instanceof Error ? error.message : 'Failed to update workspace',
                ),
            }),
          ),
        ),
      ),
      updateWorkspaceSuccess$: events.on(WorkspacesEvents.updateWorkspaceSuccess).pipe(
        tap(({ payload }) => {
          snackBar.open(`Workspace ${payload?.name ?? ''} updated successfully`, 'Close', {
            duration: 6000,
          });
        }),
      ),
      updateWorkspaceFailure$: events.on(WorkspacesEvents.updateWorkspaceFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, 'Close', { duration: 6000 });
        }),
      ),

      deleteWorkspace$: events.on(WorkspacesEvents.deleteWorkspace).pipe(
        exhaustMap(({ payload }) =>
          from(workspacesService.deleteWorkspace(payload.workspace.id)).pipe(
            mapResponse({
              next: () =>
                WorkspacesEvents.deleteWorkspaceSuccess({ workspace: payload.workspace }),
              error: (error: unknown) =>
                WorkspacesEvents.deleteWorkspaceFailure({
                  error:
                    error instanceof Error ? error.message : 'Failed to delete workspace',
                  workspace: payload.workspace,
                }),
            }),
          ),
        ),
      ),
      deleteWorkspaceSuccess$: events.on(WorkspacesEvents.deleteWorkspaceSuccess).pipe(
        tap(() => {
          snackBar.open('Workspace deleted successfully', 'Close', { duration: 6000 });
        }),
      ),
      deleteWorkspaceFailure$: events.on(WorkspacesEvents.deleteWorkspaceFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload.error, 'Close', { duration: 6000 });
        }),
      ),
    }),
  ),
);
