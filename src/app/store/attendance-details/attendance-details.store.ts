import { GetAttendance } from "@/app/types/attendaces/attendances.types";
import { signalStore, withState } from "@ngrx/signals";
import { Events, on, withEventHandlers, withReducer } from "@ngrx/signals/events";
import { AttendanceDetailsEvents } from "./attendance-details.events";
import { AttendanceDetailsService } from "@/app/services/attendance-details.service";
import { inject } from "@angular/core";
import { exhaustMap, from, map, tap } from "rxjs";
import { mapResponse } from "@ngrx/operators";
import { MatSnackBar } from "@angular/material/snack-bar";

type AttendanceDetailsState = {
  attendanceDetails: GetAttendance | null;
  loading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
};

const initialState: AttendanceDetailsState = {
  attendanceDetails: null,
  loading: false,
  updateLoading: false,
  deleteLoading: false,
};

export const AttendanceDetailsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withReducer(
    on(AttendanceDetailsEvents.loadAttendanceDetails, (_, state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(AttendanceDetailsEvents.loadAttendanceDetailsSuccess, ({ payload }, state) => ({
      ...state,
      attendanceDetails: payload.attendance,
      loading: false,
      error: null,
    })),
    on(AttendanceDetailsEvents.loadAttendanceDetailsFailure, (event, state) => ({
      ...state,
      loading: false,
      error: event.payload,
    })),

    on(AttendanceDetailsEvents.updateAttendanceDetails, (_, state) => ({
      ...state,
      updateLoading: true,
      error: null,
    })),
    on(AttendanceDetailsEvents.updateAttendanceDetailsSuccess, ({ payload }, state) => ({
      ...state,
      attendanceDetails: payload.attendance,
      updateLoading: false,
      error: null,
    })),
    on(AttendanceDetailsEvents.updateAttendanceDetailsFailure, (event, state) => ({
      ...state,
      updateLoading: false,
      error: event.payload,
    })),

    on(AttendanceDetailsEvents.deleteAttendanceDetails, (_, state) => ({
      ...state,
      deleteLoading: true,
      error: null,
    })),
    on(AttendanceDetailsEvents.deleteAttendanceDetailsSuccess, (_, state) => ({
      ...state,
      deleteLoading: false,
      error: null,
    })),
    on(AttendanceDetailsEvents.deleteAttendanceDetailsFailure, (event, state) => ({
      ...state,
      deleteLoading: false,
      error: event.payload,
    })),
  ),
  withEventHandlers(
    (
      store,
      events = inject(Events),
      attendanceDetailsService = inject(AttendanceDetailsService),
      snackBar = inject(MatSnackBar),
    ) => ({
      loadAttendanceDetails$: events.on(AttendanceDetailsEvents.loadAttendanceDetails).pipe(
        exhaustMap(({ payload }) => from(attendanceDetailsService.getAttendanceDetails(payload.id))),
        mapResponse({
          next: (response) => AttendanceDetailsEvents.loadAttendanceDetailsSuccess({ attendance: response }),
          error: (error: unknown) => AttendanceDetailsEvents.loadAttendanceDetailsFailure(error instanceof Error ? error.message : 'Failed to load attendance details'),
        })
      ),
      loadAttendanceDetailsFailure$: events.on(AttendanceDetailsEvents.loadAttendanceDetailsFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, "Close", { duration: 6000 });
        })
      ),

      updateAttendanceDetails$: events.on(AttendanceDetailsEvents.updateAttendanceDetails).pipe(
        exhaustMap(({ payload }) => from(attendanceDetailsService.updateAttendanceDetails(payload.id, payload.payload))),
        mapResponse({
          next: (response) => AttendanceDetailsEvents.updateAttendanceDetailsSuccess({ attendance: response }),
          error: (error: unknown) => AttendanceDetailsEvents.updateAttendanceDetailsFailure(error instanceof Error ? error.message : 'Failed to update attendance details'),
        })
      ),
      updateAttendanceDetailsSuccess$: events.on(AttendanceDetailsEvents.updateAttendanceDetailsSuccess).pipe(
        tap(() => {
          snackBar.open('Attendance details updated successfully', 'Close', { duration: 5000 });
        })
      ),
      updateAttendanceDetailsFailure$: events.on(AttendanceDetailsEvents.updateAttendanceDetailsFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, "Close", { duration: 6000 });
        })
      ),

      deleteAttendanceDetails$: events.on(AttendanceDetailsEvents.deleteAttendanceDetails).pipe(
        exhaustMap(({ payload }) => from(attendanceDetailsService.deleteAttendanceDetails(payload.id))),
        mapResponse({
          next: () => AttendanceDetailsEvents.deleteAttendanceDetailsSuccess(),
          error: (error: unknown) => AttendanceDetailsEvents.deleteAttendanceDetailsFailure(error instanceof Error ? error.message : 'Failed to delete attendance details'),
        })
      ),
      deleteAttendanceDetailsSuccess$: events.on(AttendanceDetailsEvents.deleteAttendanceDetailsSuccess).pipe(
        tap(() => {
          snackBar.open('Attendance details deleted successfully', 'Close', { duration: 5000 });
        })
      ),
      deleteAttendanceDetailsFailure$: events.on(AttendanceDetailsEvents.deleteAttendanceDetailsFailure).pipe(
        map(({ payload }) => {
          snackBar.open(payload, "Close", { duration: 6000 });
        })
      ),
    }),
  ),
);