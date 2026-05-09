import { GetAttendance } from "@/app/types/attendance/attendance.types";
import { signalStore, withComputed, withState } from "@ngrx/signals";
import { addEntity, prependEntity, removeAllEntities, removeEntity, SelectEntityId, setAllEntities, withEntities } from "@ngrx/signals/entities";
import { Events, on, withEventHandlers, withReducer } from "@ngrx/signals/events";
import { AttendanceEvents } from "./attendance.events";
import { computed, inject } from "@angular/core";
import { AttendanceService } from "@/app/services/attendance.service";
import { exhaustMap, from, map, tap } from "rxjs";
import { mapResponse } from "@ngrx/operators";
import { MatSnackBar } from "@angular/material/snack-bar";

type AttendanceEntity = GetAttendance;

type AttendanceState = {
  filters: { q: string };
  currentAttendanceId: string | null;
  loading: boolean;
  loadingForm: boolean;
  deleteLoading: boolean;
  error: string | null;
};

const selectId: SelectEntityId<AttendanceEntity> = (record) => record.id;

const initialState: AttendanceState = {
  filters: { q: '' },
  currentAttendanceId: null,
  loading: false,
  loadingForm: false,
  deleteLoading: false,
  error: null,
};

export const AttendanceStore = signalStore(
  { providedIn: 'root' },
  withEntities<AttendanceEntity>(),
  withState(initialState),
  withComputed(({ entities, entityMap, filters }) => ({
    records: computed(() => [...entities()].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )),
    filteredAttendance: computed(() => {
      const q = filters().q?.toLowerCase() ?? '';
      return entities().filter(
        (record) =>
          record.name.toLowerCase().includes(q)
      );
    }),
    recordsMap: entityMap,
    hasRecords: computed(() => !!entities().length),
  })),
  withReducer(
    // Load
    on(AttendanceEvents.loadAttendance, ({ payload }, state) => ({
      ...state,
      loading: true,
      error: null,
      currentAttendanceId: payload.attendance_id,
    })),
    on(AttendanceEvents.loadAttendanceSuccess, ({ payload }) => [
      setAllEntities(payload ?? [], { selectId }),
      { loading: false, error: null },
    ]),
    on(AttendanceEvents.loadAttendanceFailure, (event, state) => ({
      ...state,
      loading: false,
      error: event.payload,
    })),

    // Search
    on(AttendanceEvents.searchAttendance, ({ payload }, state) => ({
      ...state,
      filters: { q: payload.q },
      error: null,
    })),
    on(AttendanceEvents.searchAttendanceSuccess, () => [
      { error: null },
    ]),
    on(AttendanceEvents.searchAttendanceFailure, (event, state) => ({
      ...state,
      error: event.payload,
    })),

    // Create
    on(AttendanceEvents.createAttendance, (_, state) => ({
      ...state,
      loadingForm: true,
      error: null,
    })),
    on(AttendanceEvents.createAttendanceSuccess, ({ payload }) => [
      prependEntity(payload, { selectId }),
      { loadingForm: false, error: null },
    ]),
    on(AttendanceEvents.createAttendanceFailure, (event, state) => ({
      ...state,
      loadingForm: false,
      error: event.payload,
    })),

    // Update
    on(AttendanceEvents.updateAttendance, (_, state) => ({
      ...state,
      loadingForm: true,
      error: null,
    })),
    on(AttendanceEvents.updateAttendanceSuccess, (_, state) => ({
      ...state,
      loadingForm: false,
      error: null,
    })),
    on(AttendanceEvents.updateAttendanceFailure, (event, state) => ({
      ...state,
      loadingForm: false,
      error: event.payload,
    })),

    // Delete
    on(AttendanceEvents.deleteAttendance, ({ payload }) => [
      removeEntity(payload.attendance.id),
      { deleteLoading: true, error: null },
    ]),
    on(AttendanceEvents.deleteAttendanceSuccess, ({ payload }) => [
      removeEntity(payload.attendance.id),
      { deleteLoading: false, error: null },
    ]),
    on(AttendanceEvents.deleteAttendanceFailure, (event) => [
      addEntity(event.payload.attendance, { selectId }),
      { deleteLoading: false, error: event.payload.error },
    ]),

    // Reset
    on(AttendanceEvents.resetStore, () => [removeAllEntities(), initialState]),
  ),

  withEventHandlers(
    (
      store,
      events = inject(Events),
      attendanceRecordsService = inject(AttendanceService),
      snackBar = inject(MatSnackBar)
    ) => ({
      loadAttendance$: events.on(AttendanceEvents.loadAttendance).pipe(
        exhaustMap(({ payload }) =>
          from(attendanceRecordsService.getAttendance(payload.attendance_id, store.filters().q)).pipe(
            mapResponse({
              next: (response) => AttendanceEvents.loadAttendanceSuccess(response),
              error: (error: unknown) => AttendanceEvents.loadAttendanceFailure(error instanceof Error ? error.message : "Failed to load attendance"),
            })
          )
        )
      ),
      loadAttendanceFailure$: events.on(AttendanceEvents.loadAttendanceFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      createAttendance$: events.on(AttendanceEvents.createAttendance).pipe(
        exhaustMap(({ payload }) =>
          from(attendanceRecordsService.createAttendance(payload.attendance_id, payload.attendance)).pipe(
            mapResponse({
              next: (response) => AttendanceEvents.createAttendanceSuccess(response),
              error: (error: unknown) => AttendanceEvents.createAttendanceFailure(error instanceof Error ? error.message : "Failed to create attendance"),
            })
          )
        )
      ),
      createAttendanceSuccess$: events.on(AttendanceEvents.createAttendanceSuccess).pipe(
        tap(() => { snackBar.open('Attendance record created successfully', 'Close', { duration: 5000 }); })
      ),
      createAttendanceFailure$: events.on(AttendanceEvents.createAttendanceFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      updateAttendance$: events.on(AttendanceEvents.updateAttendance).pipe(
        exhaustMap(({ payload }) =>
          from(attendanceRecordsService.updateAttendance(payload.attendance_id, payload.id, payload.data)).pipe(
            mapResponse({
              next: (response) => AttendanceEvents.updateAttendanceSuccess(response),
              error: (error: unknown) => AttendanceEvents.updateAttendanceFailure(error instanceof Error ? error.message : "Failed to update attendance"),
            })
          )
        )
      ),
      updateAttendanceSuccess$: events.on(AttendanceEvents.updateAttendanceSuccess).pipe(
        tap(() => { snackBar.open('Attendance record updated successfully', 'Close', { duration: 5000 }); }),
        map(() => AttendanceEvents.loadAttendance({ attendance_id: store.currentAttendanceId()! }))
      ),
      updateAttendanceFailure$: events.on(AttendanceEvents.updateAttendanceFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      deleteAttendance$: events.on(AttendanceEvents.deleteAttendance).pipe(
        exhaustMap(({ payload }) =>
          from(attendanceRecordsService.deleteAttendance(payload.attendance_id, payload.attendance.id)).pipe(
            mapResponse({
              next: () => AttendanceEvents.deleteAttendanceSuccess({ attendance: payload.attendance }),
              error: (error: unknown) => AttendanceEvents.deleteAttendanceFailure({ error: error instanceof Error ? error.message : "Failed to delete attendance", attendance: payload.attendance }),
            })
          )
        )
      ),
      deleteAttendanceSuccess$: events.on(AttendanceEvents.deleteAttendanceSuccess).pipe(
        tap(() => { snackBar.open('Attendance record deleted successfully', 'Close', { duration: 5000 }); })
      ),
      deleteAttendanceFailure$: events.on(AttendanceEvents.deleteAttendanceFailure).pipe(
        map(({ payload }) => { snackBar.open(payload.error, "Close", { duration: 6000 }); })
      ),
    })
  )
);