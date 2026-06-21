import { GetAttendanceRecord } from "@/app/types/attendance-record/attendance-record.types";
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { Events, on, withEventHandlers, withReducer } from "@ngrx/signals/events";
import { AttendanceRecordEvents } from "./attendance-record.events";
import { withEntities, setAllEntities, prependEntity, removeAllEntities, setEntity, removeEntity, SelectEntityId } from "@ngrx/signals/entities";
import { exhaustMap, from, map, mergeMap } from "rxjs";
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
  pendingRollbacks: Record<string, GetAttendanceRecord>;
};

type AttendanceRecordStoreState = AttendanceRecordState & {
  entityMap: Record<string, GetAttendanceRecord>;
};

const selectId: SelectEntityId<AttendanceRecordEntity> = (record) => record.id;

const initialState: AttendanceRecordState = {
  viewMode: 'status',
  loading: false,
  createLoading: false,
  updateLoading: false,
  error: null,
  pendingRollbacks: {},
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
      setAllEntities(payload ?? [], { selectId }),
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
    on(AttendanceRecordEvents.createAttendanceRecord, ({ payload }) => [
      prependEntity(payload.payload, { selectId }),
      { createLoading: true, error: null },
    ]),
    on(AttendanceRecordEvents.createAttendanceRecordSuccess, ({ payload }) => [
      setEntity(payload, { selectId }),
      { createLoading: false, error: null },
    ]),
    on(AttendanceRecordEvents.createAttendanceRecordFailure, ({ payload }) => [
      removeEntity(payload.id),
      { createLoading: false, error: payload.error },
    ]),

    // Update Attendance Record
    on(AttendanceRecordEvents.updateAttendanceRecord, ({ payload }, state) => {
      const storeState = state as AttendanceRecordStoreState;
      const previousRecord = storeState.entityMap[payload.id];

      if (!previousRecord) {
        return [{ updateLoading: true, error: null }];
      }

      return [
        setEntity({ ...previousRecord, ...payload.payload }),
        {
          updateLoading: true,
          error: null,
          pendingRollbacks: {
            ...storeState.pendingRollbacks,
            [payload.id]: previousRecord,
          },
        },
      ];
    }),
    on(AttendanceRecordEvents.updateAttendanceRecordSuccess, ({ payload }, state) => {
      const { [payload.id]: _, ...pendingRollbacks } = state.pendingRollbacks;

      return [
        setEntity(payload, { selectId }),
        { updateLoading: false, error: null, pendingRollbacks },
      ];
    }),
    on(AttendanceRecordEvents.updateAttendanceRecordFailure, ({ payload }, state) => {
      const previousRecord = state.pendingRollbacks[payload.id];
      const { [payload.id]: _, ...pendingRollbacks } = state.pendingRollbacks;

      if (!previousRecord) {
        return { updateLoading: false, error: payload.error };
      }

      return [
        setEntity(previousRecord, { selectId }),
        { updateLoading: false, error: payload.error, pendingRollbacks },
      ];
    }),

    on(AttendanceRecordEvents.resetStore, () => [removeAllEntities(), initialState]),
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
        mergeMap(({ payload }) => from(attendanceRecordService.createAttendanceRecord(payload.attendances_id, payload.payload)).pipe(
          mapResponse({
            next: (response) => AttendanceRecordEvents.createAttendanceRecordSuccess(response),
            error: (error: unknown) => AttendanceRecordEvents.createAttendanceRecordFailure({
              error: error instanceof Error ? error.message : "Failed to create attendance record",
              id: payload.payload.id,
            }),
          })
        )),
      ),
      createAttendanceRecordFailure$: events.on(AttendanceRecordEvents.createAttendanceRecordFailure).pipe(
        map(({ payload }) => { snackBar.open(payload.error, "Close", { duration: 6000 }); })
      ),

      updateAttendanceRecord$: events.on(AttendanceRecordEvents.updateAttendanceRecord).pipe(
        mergeMap(({ payload }) => from(attendanceRecordService.updateAttendanceRecord(payload.attendances_id, payload.id, payload.payload)).pipe(
          mapResponse({
            next: (response) => AttendanceRecordEvents.updateAttendanceRecordSuccess(response),
            error: (error: unknown) => AttendanceRecordEvents.updateAttendanceRecordFailure({
              error: error instanceof Error ? error.message : "Failed to update attendance record",
              id: payload.id,
            }),
          })
        )),
      ),
      updateAttendanceRecordFailure$: events.on(AttendanceRecordEvents.updateAttendanceRecordFailure).pipe(
        map(({ payload }) => { snackBar.open(payload.error, "Close", { duration: 6000 }); })
      ),
    }),
  ),
);
