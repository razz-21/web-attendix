import { signalStore, withComputed, withState } from "@ngrx/signals";
import { addEntity, removeEntity, setAllEntities, withEntities, SelectEntityId, prependEntity, removeAllEntities } from "@ngrx/signals/entities";
import { Events, on, withEventHandlers, withReducer } from "@ngrx/signals/events";
import { AttendancesEvents } from "./attendances.events";
import { computed, inject } from "@angular/core";
import { AttendancesService } from "@/app/services/attendances.service";
import { debounceTime, distinctUntilChanged, exhaustMap, from, map } from "rxjs";
import { mapResponse } from "@ngrx/operators";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AttendanceStatus, GetAttendance } from "@/app/types/attendaces/attendances.types";

type AttendanceEntity = GetAttendance;

type AttendancesState = {
  filters: {
    q: string;
    status: AttendanceStatus | undefined;
  };
  loading: boolean;
  attendancesLoaded: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  archiveLoading: boolean;
  setActiveLoading: boolean;
  deleteLoading: boolean;
  currentArchiveAttendance: GetAttendance | null;
  error: string | null;
};

const selectId: SelectEntityId<AttendanceEntity> = (attendance) => attendance.id;

const initialState: AttendancesState = {
  filters: {
    q: '',
    status: 'active',
  },
  loading: false,
  attendancesLoaded: false,
  createLoading: false,
  updateLoading: false,
  archiveLoading: false,
  setActiveLoading: false,
  deleteLoading: false,
  currentArchiveAttendance: null,
  error: null,
};

export const AttendancesStore = signalStore(
  { providedIn: "root" },
  withEntities<AttendanceEntity>(),
  withState(initialState),
  withComputed(({ entities, entityMap }) => ({
    attendances: entities,
    attendancesMap: entityMap,
    hasAttendances: computed(() => !!entities().length),
  })),
  withReducer(
    // Load Attendances
    on(AttendancesEvents.loadAttendances, (_, state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(AttendancesEvents.loadAttendancesSuccess, ({ payload }) => [
      setAllEntities(payload ?? []),
      {
        loading: false,
        attendancesLoaded: true,
        error: null,
      },
    ]),
    on(AttendancesEvents.loadAttendancesFailure, (event, state) => ({
      ...state,
      loading: false,
      error: event.payload,
    })),

    // Search Attendances
    on(AttendancesEvents.searchAttendances, ({ payload }, state) => ({
      ...state,
      loading: true,
      filters: { ...state.filters, q: payload.q ?? '' },
      error: null,
    })),
    on(AttendancesEvents.searchAttendancesSuccess, ({ payload }) => [
      setAllEntities(payload ?? []),
      {
        loading: false,
        error: null,
        lastLoaded: Date.now(),
      },
    ]),
    on(AttendancesEvents.searchAttendancesFailure, (event, state) => ({
      ...state,
      loading: false,
      error: event.payload,
    })),

    // Filter Attendances
    on(AttendancesEvents.filterAttendances, ({ payload }, state) => ({
      ...state,
      loading: true,
      filters: { ...state.filters, status: payload.status },
      error: null,
    })),
    on(AttendancesEvents.filterAttendancesSuccess, ({ payload }) => [
      setAllEntities(payload ?? []),
      {
        loading: false,
        error: null,
        lastLoaded: Date.now(),
      },
    ]),
    on(AttendancesEvents.filterAttendancesFailure, (event, state) => ({
      ...state,
      loading: false,
      error: event.payload,
    })),

    // Create Attendance
    on(AttendancesEvents.createAttendance, (_, state) => ({
      ...state,
      createLoading: true,
      error: null,
    })),
    on(AttendancesEvents.createAttendanceSuccess, ({ payload }) => [
      prependEntity(payload),
      {
        createLoading: false,
        error: null,
      },
    ]),
    on(AttendancesEvents.createAttendanceFailure, (event, state) => ({
      ...state,
      createLoading: false,
      error: event.payload,
    })),

    // Update Attendance
    on(AttendancesEvents.updateAttendance, (_, state) => ({
      ...state,
      updateLoading: true,
      error: null,
    })),
    on(AttendancesEvents.updateAttendanceSuccess, ({ payload }) => [
      addEntity(payload),
      {
        updateLoading: false,
        error: null,
      },
    ]),
    on(AttendancesEvents.updateAttendanceFailure, (event, state) => ({
      ...state,
      updateLoading: false,
      error: event.payload,
    })),

    // Archive Attendance
    on(AttendancesEvents.archiveAttendance, ({ payload }, state) => [
      removeEntity(payload.id),
      { ...state, archiveLoading: true, currentArchiveAttendance: payload, error: null },
    ]),
    on(AttendancesEvents.archiveAttendanceSuccess, ({ payload }) => [
      removeEntity(payload.id),
      { archiveLoading: false, error: null, currentArchiveAttendance: null },
    ]),
    on(AttendancesEvents.archiveAttendanceFailure, (event) => [
      addEntity(event.payload.attendance),
      { archiveLoading: false, error: event.payload.error, currentArchiveAttendance: null },
    ]),

    // Set Attendance As Active
    on(AttendancesEvents.setAttendanceAsActive, ({ payload }, state) => [
      removeEntity(payload.id),
      {
        ...state,
        setActiveLoading: true,
        error: null,
      }
    ]),
    on(AttendancesEvents.setAttendanceAsActiveSuccess, ({ payload }) => [
      removeEntity(payload.id),
      { setActiveLoading: false, error: null },
    ]),
    on(AttendancesEvents.setAttendanceAsActiveFailure, (event, state) => ({
      ...state,
      setActiveLoading: false,
      error: event.payload.error,
    })),

    // Delete Attendance
    on(AttendancesEvents.deleteAttendance, (_, state) => ({
      ...state,
      deleteLoading: true,
      error: null,
    })),
    on(AttendancesEvents.deleteAttendanceSuccess, ({ payload }) => [
      removeEntity(payload.id),
      {
        deleteLoading: false,
        error: null,
      },
    ]),
    on(AttendancesEvents.deleteAttendanceFailure, (event, state) => ({
      ...state,
      deleteLoading: false,
      error: event.payload.error,
    })),

    on(AttendancesEvents.resetStore, () => [removeAllEntities(), initialState]),
  ),

  withEventHandlers(
    (
      store,
      events = inject(Events),
      attendancesService = inject(AttendancesService),
      snackBar = inject(MatSnackBar)
    ) => ({
      loadAttendances$: events.on(AttendancesEvents.loadAttendances).pipe(
        exhaustMap(() =>
          from(attendancesService.getAttendances(store.filters())).pipe(
            mapResponse({
              next: (response) => AttendancesEvents.loadAttendancesSuccess(response),
              error: (error: unknown) => AttendancesEvents.loadAttendancesFailure(error instanceof Error ? error.message : "Failed to load attendances"),
            })
          )
        )
      ),
      loadAttendancesFailure$: events.on(AttendancesEvents.loadAttendancesFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, "Close", { duration: 6000 });
        })
      ),

      searchAttendances$: events.on(AttendancesEvents.searchAttendances).pipe(
        distinctUntilChanged((prev, curr) => prev.payload.q === curr.payload.q),
        debounceTime(500),
        exhaustMap(({ payload }) =>
          from(attendancesService.getAttendances({ ...store.filters(), q: payload.q })).pipe(
            mapResponse({
              next: (response) => AttendancesEvents.searchAttendancesSuccess(response),
              error: (error: unknown) => AttendancesEvents.searchAttendancesFailure(error instanceof Error ? error.message : "Failed to search attendances"),
            })
          )
        )
      ),
      searchAttendancesFailure$: events.on(AttendancesEvents.searchAttendancesFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, "Close", { duration: 6000 });
        })
      ),

      filterAttendances$: events.on(AttendancesEvents.filterAttendances).pipe(
        exhaustMap(({ payload }) =>
          from(attendancesService.getAttendances({ ...store.filters(), status: payload.status })).pipe(
            mapResponse({
              next: (response) => AttendancesEvents.filterAttendancesSuccess(response),
              error: (error: unknown) => AttendancesEvents.filterAttendancesFailure(error instanceof Error ? error.message : "Failed to filter attendances"),
            })
          )
        )
      ),
      filterAttendancesFailure$: events.on(AttendancesEvents.filterAttendancesFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, "Close", { duration: 6000 });
        })
      ),

      createAttendance$: events.on(AttendancesEvents.createAttendance).pipe(
        exhaustMap(({ payload }) =>
          from(attendancesService.createAttendance(payload)).pipe(
            mapResponse({
              next: (response) => AttendancesEvents.createAttendanceSuccess(response),
              error: (error: unknown) => AttendancesEvents.createAttendanceFailure(error instanceof Error ? error.message : "Failed to create attendance"),
            })
          )
        )
      ),
      createAttendanceSuccess$: events.on(AttendancesEvents.createAttendanceSuccess).pipe(
        map(() => {
          snackBar.open('Attendance created successfully', 'Close', { duration: 5000 });
        })
      ),
      createAttendanceFailure$: events.on(AttendancesEvents.createAttendanceFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, "Close", { duration: 6000 });
        })
      ),

      updateAttendance$: events.on(AttendancesEvents.updateAttendance).pipe(
        exhaustMap(({ payload }) =>
          from(attendancesService.updateAttendance(payload.id, payload.data)).pipe(
            mapResponse({
              next: (response) => AttendancesEvents.updateAttendanceSuccess(response),
              error: (error: unknown) => AttendancesEvents.updateAttendanceFailure(error instanceof Error ? error.message : "Failed to update attendance"),
            })
          )
        )
      ),
      updateAttendanceSuccess$: events.on(AttendancesEvents.updateAttendanceSuccess).pipe(
        map(() => {
          snackBar.open('Attendance updated successfully', 'Close', { duration: 5000 });
        })
      ),
      updateAttendanceFailure$: events.on(AttendancesEvents.updateAttendanceFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, "Close", { duration: 6000 });
        })
      ),

      archiveAttendance$: events.on(AttendancesEvents.archiveAttendance).pipe(
        exhaustMap(({ payload }) =>
          from(attendancesService.updateAttendance(payload.id, { status: 'archived' })).pipe(
            mapResponse({
              next: (response) => AttendancesEvents.archiveAttendanceSuccess(response),
              error: (error: unknown) => AttendancesEvents.archiveAttendanceFailure({ error: error instanceof Error ? error.message : "Failed to archive attendance", attendance: payload }),
            })
          )
        )
      ),
      archiveAttendanceSuccess$: events.on(AttendancesEvents.archiveAttendanceSuccess).pipe(
        map(() => {
          snackBar.open('Attendance archived successfully', 'Close', { duration: 5000 });
        })
      ),
      archiveAttendanceFailure$: events.on(AttendancesEvents.archiveAttendanceFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload.error, "Close", { duration: 6000 });
        })
      ),

      setAttendanceAsActive$: events.on(AttendancesEvents.setAttendanceAsActive).pipe(
        exhaustMap(({ payload }) =>
          from(attendancesService.updateAttendance(payload.id, { status: 'active' })).pipe(
            mapResponse({
              next: (response) => AttendancesEvents.setAttendanceAsActiveSuccess(response),
              error: (error: unknown) => AttendancesEvents.setAttendanceAsActiveFailure({ error: error instanceof Error ? error.message : "Failed to set attendance as active", attendance: payload }),
            })
          )
        )
      ),
      setAttendanceAsActiveSuccess$: events.on(AttendancesEvents.setAttendanceAsActiveSuccess).pipe(
        map(() => {
          snackBar.open('Attendance set as active successfully', 'Close', { duration: 5000 });
        })
      ),
      setAttendanceAsActiveFailure$: events.on(AttendancesEvents.setAttendanceAsActiveFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload.error, "Close", { duration: 6000 });
        })
      ),

      deleteAttendance$: events.on(AttendancesEvents.deleteAttendance).pipe(
        exhaustMap(({ payload }) =>
          from(attendancesService.deleteAttendance(payload.id)).pipe(
            mapResponse({
              next: () => AttendancesEvents.deleteAttendanceSuccess(payload),
              error: (error: unknown) => AttendancesEvents.deleteAttendanceFailure({ error: error instanceof Error ? error.message : "Failed to delete attendance", attendance: payload }),
            })
          )
        )
      ),
      deleteAttendanceSuccess$: events.on(AttendancesEvents.deleteAttendanceSuccess).pipe(
        map(() => {
          snackBar.open('Attendance deleted successfully', 'Close', { duration: 5000 });
        })
      ),
      deleteAttendanceFailure$: events.on(AttendancesEvents.deleteAttendanceFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload.error, "Close", { duration: 6000 });
        })
      ),
    })
  )
);
