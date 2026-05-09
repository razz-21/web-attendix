import { GetAttendanceRecord } from "@/app/types/attendance-records/attendance-records.types";
import { signalStore, withComputed, withState } from "@ngrx/signals";
import { addEntity, prependEntity, removeAllEntities, removeEntity, SelectEntityId, setAllEntities, withEntities } from "@ngrx/signals/entities";
import { Events, on, withEventHandlers, withReducer } from "@ngrx/signals/events";
import { AttendanceRecordsEvents } from "./attendance-records.events";
import { computed, inject } from "@angular/core";
import { AttendanceRecordsService } from "@/app/services/attendance-records.service";
import { debounceTime, distinctUntilChanged, exhaustMap, from, map, tap } from "rxjs";
import { mapResponse } from "@ngrx/operators";
import { MatSnackBar } from "@angular/material/snack-bar";

type AttendanceRecordEntity = GetAttendanceRecord;

type AttendanceRecordsState = {
  filters: { q: string };
  currentAttendanceId: string | null;
  loading: boolean;
  loadingForm: boolean;
  deleteLoading: boolean;
  error: string | null;
};

const selectId: SelectEntityId<AttendanceRecordEntity> = (record) => record.id;

const initialState: AttendanceRecordsState = {
  filters: { q: '' },
  currentAttendanceId: null,
  loading: false,
  loadingForm: false,
  deleteLoading: false,
  error: null,
};

export const AttendanceRecordsStore = signalStore(
  { providedIn: 'root' },
  withEntities<AttendanceRecordEntity>(),
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
    on(AttendanceRecordsEvents.loadAttendanceRecords, ({ payload }, state) => ({
      ...state,
      loading: true,
      error: null,
      currentAttendanceId: payload.attendance_id,
    })),
    on(AttendanceRecordsEvents.loadAttendanceRecordsSuccess, ({ payload }) => [
      setAllEntities(payload ?? [], { selectId }),
      { loading: false, error: null },
    ]),
    on(AttendanceRecordsEvents.loadAttendanceRecordsFailure, (event, state) => ({
      ...state,
      loading: false,
      error: event.payload,
    })),

    // Search
    on(AttendanceRecordsEvents.searchAttendanceRecords, ({ payload }, state) => ({
      ...state,
      loading: true,
      filters: { q: payload.q },
      error: null,
    })),
    on(AttendanceRecordsEvents.searchAttendanceRecordsSuccess, ({ payload }) => [
      setAllEntities(payload ?? [], { selectId }),
      { loading: false, error: null },
    ]),
    on(AttendanceRecordsEvents.searchAttendanceRecordsFailure, (event, state) => ({
      ...state,
      loading: false,
      error: event.payload,
    })),

    // Create
    on(AttendanceRecordsEvents.createAttendanceRecord, (_, state) => ({
      ...state,
      loadingForm: true,
      error: null,
    })),
    on(AttendanceRecordsEvents.createAttendanceRecordSuccess, ({ payload }) => [
      prependEntity(payload, { selectId }),
      { loadingForm: false, error: null },
    ]),
    on(AttendanceRecordsEvents.createAttendanceRecordFailure, (event, state) => ({
      ...state,
      loadingForm: false,
      error: event.payload,
    })),

    // Update
    on(AttendanceRecordsEvents.updateAttendanceRecord, (_, state) => ({
      ...state,
      loadingForm: true,
      error: null,
    })),
    on(AttendanceRecordsEvents.updateAttendanceRecordSuccess, (_, state) => ({
      ...state,
      loadingForm: false,
      error: null,
    })),
    on(AttendanceRecordsEvents.updateAttendanceRecordFailure, (event, state) => ({
      ...state,
      loadingForm: false,
      error: event.payload,
    })),

    // Delete
    on(AttendanceRecordsEvents.deleteAttendanceRecord, ({ payload }) => [
      removeEntity(payload.record.id),
      { deleteLoading: true, error: null },
    ]),
    on(AttendanceRecordsEvents.deleteAttendanceRecordSuccess, ({ payload }) => [
      removeEntity(payload.record.id),
      { deleteLoading: false, error: null },
    ]),
    on(AttendanceRecordsEvents.deleteAttendanceRecordFailure, (event) => [
      addEntity(event.payload.record, { selectId }),
      { deleteLoading: false, error: event.payload.error },
    ]),

    // Reset
    on(AttendanceRecordsEvents.resetStore, () => [removeAllEntities(), initialState]),
  ),

  withEventHandlers(
    (
      store,
      events = inject(Events),
      attendanceRecordsService = inject(AttendanceRecordsService),
      snackBar = inject(MatSnackBar)
    ) => ({
      loadAttendanceRecords$: events.on(AttendanceRecordsEvents.loadAttendanceRecords).pipe(
        exhaustMap(({ payload }) =>
          from(attendanceRecordsService.getAttendanceRecords(payload.attendance_id, store.filters().q)).pipe(
            mapResponse({
              next: (response) => AttendanceRecordsEvents.loadAttendanceRecordsSuccess(response),
              error: (error: unknown) => AttendanceRecordsEvents.loadAttendanceRecordsFailure(error instanceof Error ? error.message : "Failed to load attendance records"),
            })
          )
        )
      ),
      loadAttendanceRecordsFailure$: events.on(AttendanceRecordsEvents.loadAttendanceRecordsFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      searchAttendanceRecords$: events.on(AttendanceRecordsEvents.searchAttendanceRecords).pipe(
        distinctUntilChanged((prev, curr) => prev.payload.q === curr.payload.q),
        debounceTime(500),
        exhaustMap(() =>
          from(attendanceRecordsService.getAttendanceRecords(store.currentAttendanceId()!, store.filters().q)).pipe(
            mapResponse({
              next: (response) => AttendanceRecordsEvents.searchAttendanceRecordsSuccess(response),
              error: (error: unknown) => AttendanceRecordsEvents.searchAttendanceRecordsFailure(error instanceof Error ? error.message : "Failed to search attendance records"),
            })
          )
        )
      ),
      searchAttendanceRecordsFailure$: events.on(AttendanceRecordsEvents.searchAttendanceRecordsFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      createAttendanceRecord$: events.on(AttendanceRecordsEvents.createAttendanceRecord).pipe(
        exhaustMap(({ payload }) =>
          from(attendanceRecordsService.createAttendanceRecord(payload.attendance_id, payload.record)).pipe(
            mapResponse({
              next: (response) => AttendanceRecordsEvents.createAttendanceRecordSuccess(response),
              error: (error: unknown) => AttendanceRecordsEvents.createAttendanceRecordFailure(error instanceof Error ? error.message : "Failed to create attendance record"),
            })
          )
        )
      ),
      createAttendanceRecordSuccess$: events.on(AttendanceRecordsEvents.createAttendanceRecordSuccess).pipe(
        tap(() => { snackBar.open('Attendance record created successfully', 'Close', { duration: 5000 }); })
      ),
      createAttendanceRecordFailure$: events.on(AttendanceRecordsEvents.createAttendanceRecordFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      updateAttendanceRecord$: events.on(AttendanceRecordsEvents.updateAttendanceRecord).pipe(
        exhaustMap(({ payload }) =>
          from(attendanceRecordsService.updateAttendanceRecord(payload.attendance_id, payload.id, payload.data)).pipe(
            mapResponse({
              next: (response) => AttendanceRecordsEvents.updateAttendanceRecordSuccess(response),
              error: (error: unknown) => AttendanceRecordsEvents.updateAttendanceRecordFailure(error instanceof Error ? error.message : "Failed to update attendance record"),
            })
          )
        )
      ),
      updateAttendanceRecordSuccess$: events.on(AttendanceRecordsEvents.updateAttendanceRecordSuccess).pipe(
        tap(() => { snackBar.open('Attendance record updated successfully', 'Close', { duration: 5000 }); }),
        map(() => AttendanceRecordsEvents.loadAttendanceRecords({ attendance_id: store.currentAttendanceId()! }))
      ),
      updateAttendanceRecordFailure$: events.on(AttendanceRecordsEvents.updateAttendanceRecordFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      deleteAttendanceRecord$: events.on(AttendanceRecordsEvents.deleteAttendanceRecord).pipe(
        exhaustMap(({ payload }) =>
          from(attendanceRecordsService.deleteAttendanceRecord(payload.attendance_id, payload.record.id)).pipe(
            mapResponse({
              next: () => AttendanceRecordsEvents.deleteAttendanceRecordSuccess({ record: payload.record }),
              error: (error: unknown) => AttendanceRecordsEvents.deleteAttendanceRecordFailure({ error: error instanceof Error ? error.message : "Failed to delete attendance record", record: payload.record }),
            })
          )
        )
      ),
      deleteAttendanceRecordSuccess$: events.on(AttendanceRecordsEvents.deleteAttendanceRecordSuccess).pipe(
        tap(() => { snackBar.open('Attendance record deleted successfully', 'Close', { duration: 5000 }); })
      ),
      deleteAttendanceRecordFailure$: events.on(AttendanceRecordsEvents.deleteAttendanceRecordFailure).pipe(
        map(({ payload }) => { snackBar.open(payload.error, "Close", { duration: 6000 }); })
      ),
    })
  )
);