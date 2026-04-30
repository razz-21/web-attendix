import { GetGroup } from "@/app/types/groups/groups.type";
import { signalStore, withComputed, withState } from "@ngrx/signals";
import { addEntity, prependEntity, removeAllEntities, removeEntity, SelectEntityId, setAllEntities, withEntities } from "@ngrx/signals/entities";
import { Events, on, withEventHandlers, withReducer } from "@ngrx/signals/events";
import { GroupsEvents } from "./groups.events";
import { computed, inject } from "@angular/core";
import { GroupsService } from "@/app/services/groups.service";
import { debounceTime, distinctUntilChanged, exhaustMap, from, map, tap } from "rxjs";
import { mapResponse } from "@ngrx/operators";
import { MatSnackBar } from "@angular/material/snack-bar";

type GroupEntity = GetGroup;

type GroupsState = {
  pagination: { page: number; limit: number; total: number; };
  filters: { q?: string; workspace_id?: string; } 
  loading: boolean;
  loadingForm: boolean;
  deleteLoading: boolean;
  currentDeleteGroup: GetGroup | null;
  error: string | null;
};

const selectId: SelectEntityId<GroupEntity> = (group) => group.id;

const initialFilters: GroupsState['filters'] = {
  q: undefined,
  workspace_id: undefined, 
};
const initialPagination: GroupsState['pagination'] = {
  page: 1,
  limit: 10,
  total: 0,
};
const initialState: GroupsState = {
  pagination: { ...initialPagination },
  filters: initialFilters,
  loading: false,
  loadingForm: false,
  deleteLoading: false,
  currentDeleteGroup: null,
  error: null,
};

export const GroupsStore = signalStore(
  { providedIn: "root" },
  withEntities<GroupEntity>(),
  withState(initialState),
  withComputed(({ entities, entityMap, filters }) => ({
    groupsMap: entityMap,
    groups: entities,
    hasGroups: computed(() => !!entities().length),
    hasFilters: computed(() => !!filters().q || !!filters().workspace_id),
  })),
  withReducer(
    // Load groups
    on(GroupsEvents.loadGroups, (_, state) => ({ ...state, loading: true, error: null })),
    on(GroupsEvents.loadGroupsSuccess, ({ payload }) => [
      setAllEntities(payload?.data ?? [], { selectId }),
      { pagination: { page: payload?.page ?? 1, limit: payload?.limit ?? 10, total: payload?.total ?? 0 }, loading: false, error: null },
    ]),
    on(GroupsEvents.loadGroupsFailure, (event, state) => ({ ...state, loading: false, error: event.payload })),

    // Search groups
    on(GroupsEvents.searchGroups, ({ payload }, state) => ({ ...state, filters: { ...state.filters, q: payload.q }, loading: true, error: null })),
    on(GroupsEvents.searchGroupsSuccess, ({ payload }) => [
      setAllEntities(payload?.data ?? [], { selectId }),
      { pagination: { page: payload?.page ?? 1, limit: payload?.limit ?? 10, total: payload?.total ?? 0 }, loading: false, error: null },
    ]),
    on(GroupsEvents.searchGroupsFailure, (event, state) => ({ ...state, loading: false, error: event.payload })),

    // Filter groups
    on(GroupsEvents.filterGroups, ({ payload }, state) => ({ ...state, filters: { ...state.filters, ...payload }, loading: true, error: null })),
    on(GroupsEvents.filterGroupsSuccess, ({ payload }) => [
      setAllEntities(payload?.data ?? [], { selectId }),
      { pagination: { page: payload?.page ?? 1, limit: payload?.limit ?? 10, total: payload?.total ?? 0 }, loading: false, error: null },
    ]),
    on(GroupsEvents.filterGroupsFailure, (event, state) => ({ ...state, loading: false, error: event.payload })),

    // Paginate groups
    on(GroupsEvents.paginateGroups, ({ payload }, state) => ({ ...state, pagination: { ...state.pagination, page: payload.page, limit: payload.limit }, loading: true, error: null })),
    on(GroupsEvents.paginateGroupsSuccess, ({ payload }) => [
      setAllEntities(payload?.data ?? [], { selectId }),
      { pagination: { page: payload?.page ?? 1, limit: payload?.limit ?? 10, total: payload?.total ?? 0 }, loading: false, error: null },
    ]),
    on(GroupsEvents.paginateGroupsFailure, (event, state) => ({ ...state, loading: false, error: event.payload })),

    // Clear filters
    on(GroupsEvents.clearFilters, (_, state) => ({ ...state, loading: true, filters: { q: undefined, workspace_id: undefined } })),

    // Create group
    on(GroupsEvents.createGroup, (_, state) => ({ ...state, loadingForm: true, error: null })),
    on(GroupsEvents.createGroupSuccess, ({ payload }) => [
      prependEntity(payload, { selectId }),
      { loadingForm: false, error: null },
    ]),
    on(GroupsEvents.createGroupFailure, (event, state) => ({ ...state, loadingForm: false, error: event.payload })),

    // Delete group
    on(GroupsEvents.deleteGroup, ({ payload }) => [
      removeEntity(payload.group.id),
      { deleteLoading: true, currentDeleteGroup: payload.group, error: null },
    ]),
    on(GroupsEvents.deleteGroupSuccess, ({ payload }) => [
      removeEntity(payload.group.id),
      { deleteLoading: false, error: null, currentDeleteGroup: null },
    ]),
    on(GroupsEvents.deleteGroupFailure, (event) => [
      addEntity(event.payload.group, { selectId }),
      { deleteLoading: false, error: event.payload.error, currentDeleteGroup: null },
    ]),

    // Reset
    on(GroupsEvents.resetStore, () => [removeAllEntities(), initialState]),
  ),

  withEventHandlers(
    (
      store,
      events = inject(Events),
      groupsService = inject(GroupsService),
      snackBar = inject(MatSnackBar)
    ) => ({
      loadGroups$: events.on(GroupsEvents.loadGroups).pipe(
        exhaustMap(() =>
          from(groupsService.getPaginatedGroups(store.pagination().page, store.pagination().limit, store.filters().q, store.filters().workspace_id)).pipe( 
            mapResponse({
              next: (response) => GroupsEvents.loadGroupsSuccess(response),
              error: (error: unknown) => GroupsEvents.loadGroupsFailure(error instanceof Error ? error.message : "Failed to load groups"),
            })
          )
        )
      ),
      loadGroupsFailure$: events.on(GroupsEvents.loadGroupsFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      searchGroups$: events.on(GroupsEvents.searchGroups).pipe(
        distinctUntilChanged((prev, curr) => prev.payload.q === curr.payload.q),
        debounceTime(500),
        exhaustMap(() =>
          from(groupsService.getPaginatedGroups(store.pagination().page, store.pagination().limit, store.filters().q, store.filters().workspace_id)).pipe( 
            mapResponse({
              next: (response) => GroupsEvents.searchGroupsSuccess(response),
              error: (error: unknown) => GroupsEvents.searchGroupsFailure(error instanceof Error ? error.message : "Failed to search groups"),
            })
          )
        )
      ),
      searchGroupsFailure$: events.on(GroupsEvents.searchGroupsFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      filterGroups$: events.on(GroupsEvents.filterGroups).pipe(
        exhaustMap(() =>
          from(groupsService.getPaginatedGroups(store.pagination().page, store.pagination().limit, store.filters().q, store.filters().workspace_id)).pipe( 
            mapResponse({
              next: (response) => GroupsEvents.filterGroupsSuccess(response),
              error: (error: unknown) => GroupsEvents.filterGroupsFailure(error instanceof Error ? error.message : "Failed to filter groups"),
            })
          )
        )
      ),
      filterGroupsFailure$: events.on(GroupsEvents.filterGroupsFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      paginateGroups$: events.on(GroupsEvents.paginateGroups).pipe(
        exhaustMap(() =>
          from(groupsService.getPaginatedGroups(store.pagination().page, store.pagination().limit, store.filters().q, store.filters().workspace_id)).pipe( 
            mapResponse({
              next: (response) => GroupsEvents.paginateGroupsSuccess(response),
              error: (error: unknown) => GroupsEvents.paginateGroupsFailure(error instanceof Error ? error.message : "Failed to paginate groups"),
            })
          )
        )
      ),
      paginateGroupsFailure$: events.on(GroupsEvents.paginateGroupsFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      clearFilters$: events.on(GroupsEvents.clearFilters).pipe(
        exhaustMap(() =>
          from(groupsService.getPaginatedGroups(store.pagination().page, store.pagination().limit)).pipe(
            mapResponse({
              next: (response) => GroupsEvents.paginateGroupsSuccess(response),
              error: (error: unknown) => GroupsEvents.paginateGroupsFailure(error instanceof Error ? error.message : "Failed to load groups"),
            })
          )
        )
      ),

      createGroup$: events.on(GroupsEvents.createGroup).pipe(
        exhaustMap(({ payload }) =>
          from(groupsService.createGroup(payload.group)).pipe(
            mapResponse({
              next: (response) => GroupsEvents.createGroupSuccess(response),
              error: (error: unknown) => GroupsEvents.createGroupFailure(error instanceof Error ? error.message : "Failed to create group"),
            })
          )
        )
      ),
      createGroupSuccess$: events.on(GroupsEvents.createGroupSuccess).pipe(
        tap(({ payload }) => {
          snackBar.open(`Group ${payload?.name} created successfully`, "Close", { duration: 6000 });
        })
      ),
      createGroupFailure$: events.on(GroupsEvents.createGroupFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      deleteGroup$: events.on(GroupsEvents.deleteGroup).pipe(
        exhaustMap(({ payload }) =>
          from(groupsService.deleteGroup(payload.group.id)).pipe(
            mapResponse({
              next: () => GroupsEvents.deleteGroupSuccess({ group: payload.group }),
              error: (error: unknown) => GroupsEvents.deleteGroupFailure({ error: error instanceof Error ? error.message : "Failed to delete group", group: payload.group }),
            })
          )
        )
      ),
      deleteGroupSuccess$: events.on(GroupsEvents.deleteGroupSuccess).pipe(
        tap(() => { snackBar.open(`Group deleted successfully`, "Close", { duration: 6000 }); })
      ),
      deleteGroupFailure$: events.on(GroupsEvents.deleteGroupFailure).pipe(
        map(({ payload }) => { snackBar.open(payload.error, "Close", { duration: 6000 }); })
      ),
    })
  )
);