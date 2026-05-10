import { GetAttendee } from "@/app/types/attendaces/attendees.types";
import { signalStore, withComputed, withState } from "@ngrx/signals";
import { addEntity, removeAllEntities, removeEntity, SelectEntityId, setAllEntities, withEntities } from "@ngrx/signals/entities";
import { Events, on, withEventHandlers, withReducer } from "@ngrx/signals/events";
import { AttendanceAttendeeEvents } from "./attendance-attendee.events";
import { computed, inject } from "@angular/core";
import { AttendeesService } from "@/app/services/attendees.service";
import { exhaustMap, from, map, tap } from "rxjs";
import { mapResponse } from "@ngrx/operators";
import { MatSnackBar } from "@angular/material/snack-bar";

type AttendeeEntity = GetAttendee;

type AttendanceAttendeeState = {
  filters: { q?: string };
  currentAttendanceId: string | null;
  loading: boolean;
  loadingForm: boolean;
  deleteLoading: boolean;
  error: string | null;
};

const selectId: SelectEntityId<AttendeeEntity> = (attendee) => attendee.id;

const initialState: AttendanceAttendeeState = {
  filters: { q: undefined },
  currentAttendanceId: null,
  loading: false,
  loadingForm: false,
  deleteLoading: false,
  error: null,
};

export const AttendanceAttendeeStore = signalStore(
  { providedIn: 'root' },
  withEntities<AttendeeEntity>(),
  withState(initialState),
  withComputed(({ entities, entityMap, filters }) => ({
    attendees: computed(() => [...entities()].sort((a, b) => a.name.localeCompare(b.name))),
    filteredAttendees: computed(() => {
      const q = filters().q?.toLowerCase() ?? '';
      const sortedAttendees = [...entities()].sort((a, b) => a.name.localeCompare(b.name));
      return sortedAttendees.filter(
        (attendee) =>
          attendee.name.toLowerCase().includes(q) ||
          (attendee.rfid ?? '').toLowerCase().includes(q)
      );
    }),
    attendeesMap: entityMap,
    hasAttendees: computed(() => !!entities().length),
  })),
  withReducer(
    // Load
    on(AttendanceAttendeeEvents.loadAttendees, ({ payload }, state) => ({
      ...state,
      loading: true,
      error: null,
      currentAttendanceId: payload.attendance_id,
    })),
    on(AttendanceAttendeeEvents.loadAttendeesSuccess, ({ payload }) => [
      setAllEntities(payload.data ?? [], { selectId }),
      {
        loading: false,
        error: null,
      },
    ]),
    on(AttendanceAttendeeEvents.loadAttendeesFailure, (event, state) => ({
      ...state,
      loading: false,
      error: event.payload,
    })),

    // Search
    on(AttendanceAttendeeEvents.searchAttendees, ({ payload }, state) => ({
      ...state,
      filters: { q: payload.q },
      error: null,
    })),
    on(AttendanceAttendeeEvents.searchAttendeesSuccess, () => [
      {
        error: null,
      },
    ]),
    on(AttendanceAttendeeEvents.searchAttendeesFailure, (event, state) => ({
      ...state,
      error: event.payload,
    })),

    // Create
    on(AttendanceAttendeeEvents.createAttendee, (_, state) => ({
      ...state,
      loadingForm: true,
      error: null,
    })),
    on(AttendanceAttendeeEvents.createAttendeeSuccess, ({ payload }) => [
      addEntity(payload, { selectId }),
      { loadingForm: false, error: null },
    ]),
    on(AttendanceAttendeeEvents.createAttendeeFailure, (event, state) => ({
      ...state,
      loadingForm: false,
      error: event.payload,
    })),

    // Update
    on(AttendanceAttendeeEvents.updateAttendee, (_, state) => ({
      ...state,
      loadingForm: true,
      error: null,
    })),
    on(AttendanceAttendeeEvents.updateAttendeeSuccess, (_, state) => ({
      ...state,
      loadingForm: false,
      error: null,
    })),
    on(AttendanceAttendeeEvents.updateAttendeeFailure, (event, state) => ({
      ...state,
      loadingForm: false,
      error: event.payload,
    })),

    // Delete
    on(AttendanceAttendeeEvents.deleteAttendee, ({ payload }) => [
      removeEntity(payload.attendee.id),
      { deleteLoading: true, error: null },
    ]),
    on(AttendanceAttendeeEvents.deleteAttendeeSuccess, ({ payload }) => [
      removeEntity(payload.attendee.id),
      { deleteLoading: false, error: null },
    ]),
    on(AttendanceAttendeeEvents.deleteAttendeeFailure, (event) => [
      addEntity(event.payload.attendee, { selectId }),
      { deleteLoading: false, error: event.payload.error },
    ]),

    // Reset
    on(AttendanceAttendeeEvents.resetStore, () => [removeAllEntities(), initialState]),
  ),

  withEventHandlers(
    (
      store,
      events = inject(Events),
      attendeesService = inject(AttendeesService),
      snackBar = inject(MatSnackBar)
    ) => ({
      loadAttendees$: events.on(AttendanceAttendeeEvents.loadAttendees).pipe(
        exhaustMap(({ payload }) =>
          from(attendeesService.getAttendeesByAttendance(payload.attendance_id, {
            q: payload.q,
          })).pipe(
            mapResponse({
              next: (response) => AttendanceAttendeeEvents.loadAttendeesSuccess({
                data: response.data ?? [],
                total: response.total ?? 0,
              }),
              error: (error: unknown) => AttendanceAttendeeEvents.loadAttendeesFailure(error instanceof Error ? error.message : "Failed to load attendees"),
            })
          )
        )
      ),
      loadAttendeesFailure$: events.on(AttendanceAttendeeEvents.loadAttendeesFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      createAttendee$: events.on(AttendanceAttendeeEvents.createAttendee).pipe(
        exhaustMap(({ payload }) =>
          from(attendeesService.createAttendee(payload.attendance_id, payload.attendee)).pipe(
            mapResponse({
              next: (response) => AttendanceAttendeeEvents.createAttendeeSuccess(response),
              error: (error: unknown) => AttendanceAttendeeEvents.createAttendeeFailure(error instanceof Error ? error.message : "Failed to create attendee"),
            })
          )
        )
      ),
      createAttendeeSuccess$: events.on(AttendanceAttendeeEvents.createAttendeeSuccess).pipe(
        tap(() => { snackBar.open('Attendee created successfully', 'Close', { duration: 5000 }); }),
        map(() => AttendanceAttendeeEvents.loadAttendees({ attendance_id: store.currentAttendanceId()! }))
      ),
      createAttendeeFailure$: events.on(AttendanceAttendeeEvents.createAttendeeFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      updateAttendee$: events.on(AttendanceAttendeeEvents.updateAttendee).pipe(
        exhaustMap(({ payload }) =>
          from(attendeesService.updateAttendee(payload.attendance_id, payload.id, payload.data)).pipe(
            mapResponse({
              next: (response) => AttendanceAttendeeEvents.updateAttendeeSuccess(response),
              error: (error: unknown) => AttendanceAttendeeEvents.updateAttendeeFailure(error instanceof Error ? error.message : "Failed to update attendee"),
            })
          )
        )
      ),
      updateAttendeeSuccess$: events.on(AttendanceAttendeeEvents.updateAttendeeSuccess).pipe(
        tap(() => { snackBar.open('Attendee updated successfully', 'Close', { duration: 5000 }); }),
        map(() => AttendanceAttendeeEvents.loadAttendees({ attendance_id: store.currentAttendanceId()! }))
      ),
      updateAttendeeFailure$: events.on(AttendanceAttendeeEvents.updateAttendeeFailure).pipe(
        map(({ payload }) => { snackBar.open(payload, "Close", { duration: 6000 }); })
      ),

      deleteAttendee$: events.on(AttendanceAttendeeEvents.deleteAttendee).pipe(
        exhaustMap(({ payload }) =>
          from(attendeesService.deleteAttendee(payload.attendance_id, payload.attendee.id)).pipe(
            mapResponse({
              next: () => AttendanceAttendeeEvents.deleteAttendeeSuccess({ attendee: payload.attendee }),
              error: (error: unknown) => AttendanceAttendeeEvents.deleteAttendeeFailure({
                error: error instanceof Error ? error.message : "Failed to delete attendee",
                attendee: payload.attendee,
              }),
            })
          )
        )
      ),
      deleteAttendeeSuccess$: events.on(AttendanceAttendeeEvents.deleteAttendeeSuccess).pipe(
        tap(() => { snackBar.open('Attendee deleted successfully', 'Close', { duration: 5000 }); })
      ),
      deleteAttendeeFailure$: events.on(AttendanceAttendeeEvents.deleteAttendeeFailure).pipe(
        map(({ payload }) => { snackBar.open(payload.error, "Close", { duration: 6000 }); })
      ),
    })
  ),
);
