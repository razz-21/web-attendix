import { GetAttendance } from "@/app/types/attendance/attendance.types";
import { signalStore, withComputed, withState } from "@ngrx/signals";
import { addEntity, prependEntity, removeAllEntities, removeEntity, SelectEntityId, setAllEntities, withEntities } from "@ngrx/signals/entities";
import { Events, on, withEventHandlers, withReducer } from "@ngrx/signals/events";
import { AttendanceEvents } from "./attendance.events";
import { computed, inject } from "@angular/core";
import { AttendanceService } from "@/app/services/attendance.service";
import { debounceTime, distinctUntilChanged, exhaustMap, from, map, tap } from "rxjs";
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
  withComputed(({ entities, entityMap }) => ({
    records: computed(() => [...entities()].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )),
    recordsMap: entityMap,
    hasRecords: computed(() => !!entities().length),
  })),
  withReducer(
    // Load
    on(AttendanceEvents.loadAttendanceRecords, ({ payload }, state) => ({
      ...state,
      loading: true,
      error: null,
      currentAttendanceId: payload.attendance_id,
    })),
    on(AttendanceEvents.loadAttendanceRecordsSuccess, ({ payload }) => [
      setAllEntities(payload ?? [], { selectId }),
      { loading: false, error: null },
    ]),
    on(AttendanceEvents.loadAttendanceRecordsFailure, (event, state) => ({
      ...state,
      loading: false,
      error: event.payload,
    })),

    // Search
    on(AttendanceEvents.searchAttendanceRecords, ({ payload }, state) => ({
      ...state,
      loading: true,
      filters: { q: payload.q },
      error: null,
    })),
    on(AttendanceEvents.searchAttendanceRecordsSuccess, ({ payload }) => [
      setAllEntities(payload ?? [], { selectId }),
      { loading: false, error: null },
    ]),
    on(AttendanceEvents.searchAttendanceRecordsFailure, (event, state) => ({
      ...state,
      loading: false,
      error: event.payload,
    })),

    // Create
    on(AttendanceEvents.createAttendanceRecord, (_, state) => ({
      ...state,
      loadingForm: true,
      error: null,
    })),
    on(AttendanceEvents.createAttendanceRecordSuccess, ({ payload }) => [
      prependEntity(payload, { selectId }),
      { loadingForm: false, error: null },
    ]),
    on(AttendanceEvents.createAttendanceRecordFailure, (event, state) => ({
      ...state,
      loadingForm: false,
      error: event.payload,
    })),

    // Update
    on(AttendanceEvents.updateAttendanceRecord, (_, state) => ({
      ...state,
      loadingForm: true,
      error: null,
    })),
    on(AttendanceEvents.updateAttendanceRecordSuccess, (_, state) => ({
      ...state,
      loadingForm: false,
      error: null,
    })),
    on(AttendanceEvents.updateAttendanceRecordFailure, (event, state) => ({
      ...state,
      loadingForm: false,
      error: event.payload,
    })),

    // Delete
    on(AttendanceEvents.deleteAttendanceRecord, ({ payload }) => [
      removeEntity(payload.record.id),
      { deleteLoading: true, error: null },
    ]),
    on(AttendanceEvents.deleteAttendanceRecordSuccess, ({ payload }) => [
      removeEntity(payload.record.id),
      { deleteLoading: false, error: null },
    ]),
    on(AttendanceEvents.deleteAttendanceRecordFailure, (event) => [
      addEntity(event.payload.record, { selectId }),
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
      loadAttendanceRecords$: events.on(AttendanceEvents.loadAttendanceRecords).pipe(
        exhaustMap(({ payload }) =>
          from(attendanceRecordsService.getAttendance(payload.attendance_id, store.filters().q)).pipe(
            mapResponse({
              next: (response) => AttendanceEvents.loadAttendanceRecordsSuccess(response),
              error: (error: unknown) => AttendanceEvents.loadAttendanceRecordsFailure(error instanceof Error ? error.message : "Failed to load attendance records"),
            })
          )
        )
      ),
      loadAttendanceRecordsFailure$: events.on(AttendanceEvents.loadAttendanceRecordsFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      searchAttendanceRecords$: events.on(AttendanceEvents.searchAttendanceRecords).pipe(
        distinctUntilChanged((prev, curr) => prev.payload.q === curr.payload.q),
        debounceTime(500),
        exhaustMap(() =>
          from(attendanceRecordsService.getAttendance(store.currentAttendanceId()!, store.filters().q)).pipe(
            mapResponse({
              next: (response) => AttendanceEvents.searchAttendanceRecordsSuccess(response),
              error: (error: unknown) => AttendanceEvents.searchAttendanceRecordsFailure(error instanceof Error ? error.message : "Failed to search attendance records"),
            })
          )
        )
      ),
      searchAttendanceRecordsFailure$: events.on(AttendanceEvents.searchAttendanceRecordsFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      createAttendanceRecord$: events.on(AttendanceEvents.createAttendanceRecord).pipe(
        exhaustMap(({ payload }) =>
          from(attendanceRecordsService.createAttendance(payload.attendance_id, payload.record)).pipe(
            mapResponse({
              next: (response) => AttendanceEvents.createAttendanceRecordSuccess(response),
              error: (error: unknown) => AttendanceEvents.createAttendanceRecordFailure(error instanceof Error ? error.message : "Failed to create attendance record"),
            })
          )
        )
      ),
      createAttendanceRecordSuccess$: events.on(AttendanceEvents.createAttendanceRecordSuccess).pipe(
        tap(() => { snackBar.open('Attendance record created successfully', 'Close', { duration: 5000 }); })
      ),
      createAttendanceRecordFailure$: events.on(AttendanceEvents.createAttendanceRecordFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      updateAttendanceRecord$: events.on(AttendanceEvents.updateAttendanceRecord).pipe(
        exhaustMap(({ payload }) =>
          from(attendanceRecordsService.updateAttendance(payload.attendance_id, payload.id, payload.data)).pipe(
            mapResponse({
              next: (response) => AttendanceEvents.updateAttendanceRecordSuccess(response),
              error: (error: unknown) => AttendanceEvents.updateAttendanceRecordFailure(error instanceof Error ? error.message : "Failed to update attendance record"),
            })
          )
        )
      ),
      updateAttendanceRecordSuccess$: events.on(AttendanceEvents.updateAttendanceRecordSuccess).pipe(
        tap(() => { snackBar.open('Attendance record updated successfully', 'Close', { duration: 5000 }); }),
        map(() => AttendanceEvents.loadAttendanceRecords({ attendance_id: store.currentAttendanceId()! }))
      ),
      updateAttendanceRecordFailure$: events.on(AttendanceEvents.updateAttendanceRecordFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      deleteAttendanceRecord$: events.on(AttendanceEvents.deleteAttendanceRecord).pipe(
        exhaustMap(({ payload }) =>
          from(attendanceRecordsService.deleteAttendance(payload.attendance_id, payload.record.id)).pipe(
            mapResponse({
              next: () => AttendanceEvents.deleteAttendanceRecordSuccess({ record: payload.record }),
              error: (error: unknown) => AttendanceEvents.deleteAttendanceRecordFailure({ error: error instanceof Error ? error.message : "Failed to delete attendance record", record: payload.record }),
            })
          )
        )
      ),
      deleteAttendanceRecordSuccess$: events.on(AttendanceEvents.deleteAttendanceRecordSuccess).pipe(
        tap(() => { snackBar.open('Attendance record deleted successfully', 'Close', { duration: 5000 }); })
      ),
      deleteAttendanceRecordFailure$: events.on(AttendanceEvents.deleteAttendanceRecordFailure).pipe(
        map(({ payload }) => { snackBar.open(payload.error, "Close", { duration: 6000 }); })
      ),
    })
  )
);