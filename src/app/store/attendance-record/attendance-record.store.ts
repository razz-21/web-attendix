import { GetAttendanceRecord } from "@/app/types/attendance-record/attendance-record.types";
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { Events, on, withEventHandlers, withReducer } from "@ngrx/signals/events";
import { AttendanceRecordEvents } from "./attendance-record.events";
import { withEntities, setAllEntities, prependEntity, addEntity, setEntity } from "@ngrx/signals/entities";
import { exhaustMap, from, map } from "rxjs";
import { inject } from "@angular/core";
import { AttendanceRecordService } from "@/app/services/attendance-record.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { mapResponse } from "@ngrx/operators";
import { GetAttendee } from "@/app/types/attendaces/attendees.types";

type AttendanceRecordEntity = GetAttendanceRecord;

export type AttendanceRecordViewMode = 'status' | 'points';

type AttendanceRecordState = {
  viewMode: AttendanceRecordViewMode;
  loading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  error: string | null;
};

const initialState: AttendanceRecordState = {
  viewMode: 'status',
  loading: false,
  createLoading: false,
  updateLoading: false,
  error: null,
};

export const AttendanceRecordStore = signalStore(
  { providedIn: 'root' },
  withEntities<AttendanceRecordEntity>(),
  withState(initialState),
  withComputed(({ entities, entityMap }) => ({
    attendanceRecords: entities,
    attendanceRecordsMap: entityMap,
  })),
  withMethods((store) => ({
    setViewMode(viewMode: AttendanceRecordViewMode): void {
      patchState(store, { viewMode });
    },
    attendanceRecordsByAttendanceId: (attendanceId: string) =>
      store.entities().filter((record) => record.attendance_id === attendanceId),
    attendeesAttendanceRecords: (attendees: GetAttendee[], attendanceId: string) => {
      const attendanceRecords = store
        .entities()
        .filter((record) => record.attendance_id === attendanceId);

      return attendees.map((attendee) => {
        const attendanceRecord = attendanceRecords.find(
          (record) => record.attendee_id === attendee.id,
        );
        return {
          attendee: attendee,
          attendanceRecord,
        };
      });
    },
  })),
  withReducer(
    on(AttendanceRecordEvents.loadAttendanceRecords, (_, state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(AttendanceRecordEvents.loadAttendanceRecordsSuccess, ({ payload }) => [
      setAllEntities(payload ?? []),
      {
        loading: false,
        error: null,
      },
    ]),
    on(AttendanceRecordEvents.loadAttendanceRecordsFailure, (event, state) => ({
      ...state,
      loading: false,
      error: event.payload,
    })),

    // Create Attendance Record
    on(AttendanceRecordEvents.createAttendanceRecord, (_, state) => ({
      ...state,
      createLoading: true,
      error: null,
    })),
    on(AttendanceRecordEvents.createAttendanceRecordSuccess, ({ payload }) => [
      prependEntity(payload),
      { createLoading: false, error: null },
    ]),
    on(AttendanceRecordEvents.createAttendanceRecordFailure, (event, state) => ({
      ...state,
      createLoading: false,
      error: event.payload,
    })),

    // Update Attendance Record
    on(AttendanceRecordEvents.updateAttendanceRecord, (_, state) => ({
      ...state,
      updateLoading: true,
      error: null,
    })),
    on(AttendanceRecordEvents.updateAttendanceRecordSuccess, ({ payload }) => [
      setEntity(payload),
      { updateLoading: false, error: null },
    ]),
    on(AttendanceRecordEvents.updateAttendanceRecordFailure, (event, state) => ({
      ...state,
      updateLoading: false,
      error: event.payload,
    })),
  ),
  withEventHandlers(
    (
      store,
      events = inject(Events),
      attendanceRecordService = inject(AttendanceRecordService),
      snackBar = inject(MatSnackBar)
    ) => ({
      loadAttendanceRecords$: events.on(AttendanceRecordEvents.loadAttendanceRecords).pipe(
        exhaustMap(({ payload }) => from(attendanceRecordService.getAttendanceRecords(payload.attendances_id))),
        mapResponse({
          next: (response) => AttendanceRecordEvents.loadAttendanceRecordsSuccess(response),
          error: (error: unknown) => AttendanceRecordEvents.loadAttendanceRecordsFailure(error instanceof Error ? error.message : "Failed to load attendance records"),
        })
      ),
      loadAttendanceRecordsFailure$: events.on(AttendanceRecordEvents.loadAttendanceRecordsFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, "Close", { duration: 6000 });
        })
      ),

      createAttendanceRecord$: events.on(AttendanceRecordEvents.createAttendanceRecord).pipe(
        exhaustMap(({ payload }) => from(attendanceRecordService.createAttendanceRecord(payload.attendances_id, payload.payload))),
        mapResponse({
          next: (response) => AttendanceRecordEvents.createAttendanceRecordSuccess(response),
          error: (error: unknown) => AttendanceRecordEvents.createAttendanceRecordFailure(error instanceof Error ? error.message : "Failed to create attendance record"),
        })
      ),
      createAttendanceRecordFailure$: events.on(AttendanceRecordEvents.createAttendanceRecordFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      updateAttendanceRecord$: events.on(AttendanceRecordEvents.updateAttendanceRecord).pipe(
        exhaustMap(({ payload }) => from(attendanceRecordService.updateAttendanceRecord(payload.attendances_id, payload.id, payload.payload))),
        mapResponse({
          next: (response) => AttendanceRecordEvents.updateAttendanceRecordSuccess(response),
          error: (error: unknown) => AttendanceRecordEvents.updateAttendanceRecordFailure(error instanceof Error ? error.message : "Failed to update attendance record"),
        })
      ),
      updateAttendanceRecordFailure$: events.on(AttendanceRecordEvents.updateAttendanceRecordFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),
    }),
  ),
);