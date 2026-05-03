import { GetGroupMember } from "@/app/types/group-members/group-members.type";
import { signalStore, withComputed, withState } from "@ngrx/signals";
import { addEntity, prependEntity, removeAllEntities, removeEntity, SelectEntityId, setAllEntities, updateEntity, withEntities } from "@ngrx/signals/entities";
import { Events, on, withEventHandlers, withReducer } from "@ngrx/signals/events";
import { GroupMembersEvents } from "./group-members.events";
import { computed, inject } from "@angular/core";
import { GroupMembersService } from "@/app/services/group-members.service";
import { debounceTime, distinctUntilChanged, exhaustMap, from, map, tap } from "rxjs";
import { mapResponse } from "@ngrx/operators";
import { MatSnackBar } from "@angular/material/snack-bar";

type GroupMemberEntity = GetGroupMember;

type GroupMembersState = {
  pagination: { page: number; limit: number; total: number; };
  filters: { q?: string; department?: string; };
  currentGroupId: string | null;
  loading: boolean;
  loadingForm: boolean;
  updateMemberLoading: boolean;
  deleteLoading: boolean;
  currentDeleteMember: GetGroupMember | null;
  error: string | null;
};

const selectId: SelectEntityId<GroupMemberEntity> = (member) => member.id;

const initialFilters: GroupMembersState['filters'] = {
  q: undefined,
  department: undefined,
};
const initialPagination: GroupMembersState['pagination'] = {
  page: 1,
  limit: 10,
  total: 0,
};
const initialState: GroupMembersState = {
  pagination: { ...initialPagination },
  filters: initialFilters,
  currentGroupId: null,
  loading: false,
  loadingForm: false,
  updateMemberLoading: false,
  deleteLoading: false,
  currentDeleteMember: null,
  error: null,
};

export const GroupMembersStore = signalStore(
  { providedIn: "root" },
  withEntities<GroupMemberEntity>(),
  withState(initialState),
  withComputed(({ entities, entityMap, filters }) => ({
    membersMap: entityMap,
    members: computed(() => [...entities()].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )),
    hasMembers: computed(() => !!entities().length),
    hasFilters: computed(() => !!filters().q || !!filters().department),
  })),
  withReducer(
    // Load
    on(GroupMembersEvents.loadGroupMembers, ({ payload }, state) => ({ ...state, loading: true, error: null, currentGroupId: payload.group_id })),
    on(GroupMembersEvents.loadGroupMembersSuccess, ({ payload }) => [
      setAllEntities(payload?.data ?? [], { selectId }),
      { pagination: { page: payload?.page ?? 1, limit: payload?.limit ?? 10, total: payload?.total ?? 0 }, loading: false, error: null },
    ]),
    on(GroupMembersEvents.loadGroupMembersFailure, (event, state) => ({ ...state, loading: false, error: event.payload })),

    // Search
    on(GroupMembersEvents.searchGroupMembers, ({ payload }, state) => ({ ...state, filters: { ...state.filters, q: payload.q }, loading: true, error: null })),
    on(GroupMembersEvents.searchGroupMembersSuccess, ({ payload }) => [
      setAllEntities(payload?.data ?? [], { selectId }),
      { pagination: { page: payload?.page ?? 1, limit: payload?.limit ?? 10, total: payload?.total ?? 0 }, loading: false, error: null },
    ]),
    on(GroupMembersEvents.searchGroupMembersFailure, (event, state) => ({ ...state, loading: false, error: event.payload })),

    // Filter
    on(GroupMembersEvents.filterGroupMembers, ({ payload }, state) => ({ ...state, filters: { ...state.filters, ...payload }, loading: true, error: null })),
    on(GroupMembersEvents.filterGroupMembersSuccess, ({ payload }) => [
      setAllEntities(payload?.data ?? [], { selectId }),
      { pagination: { page: payload?.page ?? 1, limit: payload?.limit ?? 10, total: payload?.total ?? 0 }, loading: false, error: null },
    ]),
    on(GroupMembersEvents.filterGroupMembersFailure, (event, state) => ({ ...state, loading: false, error: event.payload })),

    // Paginate
    on(GroupMembersEvents.paginateGroupMembers, ({ payload }, state) => ({ ...state, pagination: { ...state.pagination, page: payload.page, limit: payload.limit }, loading: true, error: null })),
    on(GroupMembersEvents.paginateGroupMembersSuccess, ({ payload }) => [
      setAllEntities(payload?.data ?? [], { selectId }),
      { pagination: { page: payload?.page ?? 1, limit: payload?.limit ?? 10, total: payload?.total ?? 0 }, loading: false, error: null },
    ]),
    on(GroupMembersEvents.paginateGroupMembersFailure, (event, state) => ({ ...state, loading: false, error: event.payload })),

    // Create
    on(GroupMembersEvents.createGroupMember, (_, state) => ({ ...state, loadingForm: true, error: null })),
    on(GroupMembersEvents.createGroupMemberSuccess, ({ payload }) => [
      prependEntity(payload, { selectId }),
      { loadingForm: false, error: null },
    ]),
    on(GroupMembersEvents.createGroupMemberFailure, (event, state) => ({ ...state, loadingForm: false, error: event.payload })),

    // Update
    on(GroupMembersEvents.updateGroupMember, (_, state) => ({ ...state, updateMemberLoading: true, error: null })),
    on(GroupMembersEvents.updateGroupMemberSuccess, ({ payload }, state) => ({
      ...state,
      updateMemberLoading: false,
      error: null,
    })),
    on(GroupMembersEvents.updateGroupMemberFailure, (event, state) => ({ ...state, updateMemberLoading: false, error: event.payload })),

    // Import
    on(GroupMembersEvents.importGroupMembers, (_, state) => ({ ...state, loadingForm: true, error: null })),
    on(GroupMembersEvents.importGroupMembersSuccess, (_, state) => ({ ...state, loadingForm: false, error: null })),
    on(GroupMembersEvents.importGroupMembersFailure, (event, state) => ({ ...state, loadingForm: false, error: event.payload })),

    // Delete
    on(GroupMembersEvents.deleteGroupMember, ({ payload }) => [
      removeEntity(payload.member.id),
      { deleteLoading: true, currentDeleteMember: payload.member, error: null },
    ]),
    on(GroupMembersEvents.deleteGroupMemberSuccess, ({ payload }) => [
      removeEntity(payload.member.id),
      { deleteLoading: false, error: null, currentDeleteMember: null },
    ]),
    on(GroupMembersEvents.deleteGroupMemberFailure, (event) => [
      addEntity(event.payload.member, { selectId }),
      { deleteLoading: false, error: event.payload.error, currentDeleteMember: null },
    ]),

    // Clear filters
    on(GroupMembersEvents.clearFilters, (_, state) => ({ ...state, loading: true, filters: { q: undefined, department: undefined } })),

    // Reset
    on(GroupMembersEvents.resetStore, () => [removeAllEntities(), initialState]),
  ),

  withEventHandlers(
    (
      store,
      events = inject(Events),
      groupMembersService = inject(GroupMembersService),
      snackBar = inject(MatSnackBar)
    ) => ({
      loadGroupMembers$: events.on(GroupMembersEvents.loadGroupMembers).pipe(
        exhaustMap(({ payload }) =>
          from(groupMembersService.getPaginatedGroupMembers(payload.group_id, { page: store.pagination().page, limit: store.pagination().limit, q: store.filters().q, department: store.filters().department, })).pipe(
            mapResponse({
              next: (response) => GroupMembersEvents.loadGroupMembersSuccess(response),
              error: (error: unknown) => GroupMembersEvents.loadGroupMembersFailure(error instanceof Error ? error.message : "Failed to load group members"),
            })
          )
        )
      ),
      loadGroupMembersFailure$: events.on(GroupMembersEvents.loadGroupMembersFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      searchGroupMembers$: events.on(GroupMembersEvents.searchGroupMembers).pipe(
        distinctUntilChanged((prev, curr) => prev.payload.q === curr.payload.q),
        debounceTime(500),
        exhaustMap(() =>
          from(groupMembersService.getPaginatedGroupMembers(store.currentGroupId()!, { page: store.pagination().page, limit: store.pagination().limit, q: store.filters().q, department: store.filters().department, })).pipe(
            mapResponse({
              next: (response) => GroupMembersEvents.searchGroupMembersSuccess(response),
              error: (error: unknown) => GroupMembersEvents.searchGroupMembersFailure(error instanceof Error ? error.message : "Failed to search group members"),
            })
          )
        )
      ),
      searchGroupMembersFailure$: events.on(GroupMembersEvents.searchGroupMembersFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      filterGroupMembers$: events.on(GroupMembersEvents.filterGroupMembers).pipe(
        exhaustMap(() =>
          from(groupMembersService.getPaginatedGroupMembers(store.currentGroupId()!, { page: store.pagination().page, limit: store.pagination().limit, q: store.filters().q, department: store.filters().department, })).pipe(
            mapResponse({
              next: (response) => GroupMembersEvents.filterGroupMembersSuccess(response),
              error: (error: unknown) => GroupMembersEvents.filterGroupMembersFailure(error instanceof Error ? error.message : "Failed to filter group members"),
            })
          )
        )
      ),
      filterGroupMembersFailure$: events.on(GroupMembersEvents.filterGroupMembersFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      paginateGroupMembers$: events.on(GroupMembersEvents.paginateGroupMembers).pipe(
        exhaustMap(() =>
          from(groupMembersService.getPaginatedGroupMembers(store.currentGroupId()!, { page: store.pagination().page, limit: store.pagination().limit, q: store.filters().q, department: store.filters().department, })).pipe(
            mapResponse({
              next: (response) => GroupMembersEvents.paginateGroupMembersSuccess(response),
              error: (error: unknown) => GroupMembersEvents.paginateGroupMembersFailure(error instanceof Error ? error.message : "Failed to paginate group members"),
            })
          )
        )
      ),
      paginateGroupMembersFailure$: events.on(GroupMembersEvents.paginateGroupMembersFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      clearFilters$: events.on(GroupMembersEvents.clearFilters).pipe(
        exhaustMap(() =>
          from(groupMembersService.getPaginatedGroupMembers(store.currentGroupId()!, { page: store.pagination().page, limit: store.pagination().limit, })).pipe(
            mapResponse({
              next: (response) => GroupMembersEvents.paginateGroupMembersSuccess(response),
              error: (error: unknown) => GroupMembersEvents.paginateGroupMembersFailure(error instanceof Error ? error.message : "Failed to load group members"),
            })
          )
        )
      ),

      createGroupMember$: events.on(GroupMembersEvents.createGroupMember).pipe(
        exhaustMap(({ payload }) =>
          from(groupMembersService.createGroupMember(payload.group_id, payload.member)).pipe(
            mapResponse({
              next: (response) => GroupMembersEvents.createGroupMemberSuccess(response),
              error: (error: unknown) => GroupMembersEvents.createGroupMemberFailure(error instanceof Error ? error.message : "Failed to create group member"),
            })
          )
        )
      ),
      createGroupMemberSuccess$: events.on(GroupMembersEvents.createGroupMemberSuccess).pipe(
        tap(({ payload }) => {
          snackBar.open(`Member ${payload?.name} added successfully`, "Close", { duration: 6000 });
        })
      ),
      createGroupMemberFailure$: events.on(GroupMembersEvents.createGroupMemberFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      updateGroupMember$: events.on(GroupMembersEvents.updateGroupMember).pipe(
        exhaustMap(({ payload }) =>
          from(groupMembersService.updateGroupMember(payload.group_id, payload.member_id, payload.payload)).pipe(
            mapResponse({
              next: (response) => GroupMembersEvents.updateGroupMemberSuccess(response),
              error: (error: unknown) => GroupMembersEvents.updateGroupMemberFailure(error instanceof Error ? error.message : "Failed to update group member"),
            })
          )
        )
      ),
     updateGroupMemberSuccess$: events.on(GroupMembersEvents.updateGroupMemberSuccess).pipe(
        tap(({ payload }) => {
          snackBar.open(`Member ${payload?.name} updated successfully`, "Close", { duration: 6000 });
        }),
      ),
      updateGroupMemberFailure$: events.on(GroupMembersEvents.updateGroupMemberFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      importGroupMembers$: events.on(GroupMembersEvents.importGroupMembers).pipe(
        exhaustMap(({ payload }) =>
          from(groupMembersService.importGroupMembers(payload.group_id, payload.members)).pipe(
            mapResponse({
              next: () => GroupMembersEvents.importGroupMembersSuccess(),
              error: (error: unknown) => GroupMembersEvents.importGroupMembersFailure(error instanceof Error ? error.message : "Failed to import group members"),
            })
          )
        )
      ),
      importGroupMembersSuccess$: events.on(GroupMembersEvents.importGroupMembersSuccess).pipe(
        tap(() => {
          snackBar.open(`Members imported successfully`, "Close", { duration: 6000 });
        })
      ),
      importGroupMembersFailure$: events.on(GroupMembersEvents.importGroupMembersFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      deleteGroupMember$: events.on(GroupMembersEvents.deleteGroupMember).pipe(
        exhaustMap(({ payload }) =>
          from(groupMembersService.deleteGroupMember(payload.group_id, payload.member.id)).pipe(
            mapResponse({
              next: () => GroupMembersEvents.deleteGroupMemberSuccess({ member: payload.member }),
              error: (error: unknown) => GroupMembersEvents.deleteGroupMemberFailure({ error: error instanceof Error ? error.message : "Failed to delete group member", member: payload.member }),
            })
          )
        )
      ),
      deleteGroupMemberSuccess$: events.on(GroupMembersEvents.deleteGroupMemberSuccess).pipe(
        tap(() => { snackBar.open(`Member deleted successfully`, "Close", { duration: 6000 }); })
      ),
      deleteGroupMemberFailure$: events.on(GroupMembersEvents.deleteGroupMemberFailure).pipe(
        map(({ payload }) => { snackBar.open(payload.error, "Close", { duration: 6000 }); })
      ),
    })
  )
);