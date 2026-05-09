import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';
import { GetAttendee, PostAttendee, PatchAttendee } from '@/app/types/attendaces/attendees.types';

export const AttendanceAttendeeEvents = eventGroup({
  source: 'Attendance Attendee Page',
  events: {
    loadAttendees: type<{ attendance_id: string; q?: string }>(),
    loadAttendeesSuccess: type<{ data: GetAttendee[]; total: number }>(),
    loadAttendeesFailure: type<string>(),

    searchAttendees: type<{ q: string }>(),
    searchAttendeesSuccess: type<{ data: GetAttendee[]; total: number }>(),
    searchAttendeesFailure: type<string>(),

    createAttendee: type<{ attendance_id: string; attendee: PostAttendee }>(),
    createAttendeeSuccess: type<GetAttendee>(),
    createAttendeeFailure: type<string>(),

    updateAttendee: type<{ attendance_id: string; id: string; data: PatchAttendee }>(),
    updateAttendeeSuccess: type<GetAttendee>(),
    updateAttendeeFailure: type<string>(),

    deleteAttendee: type<{ attendance_id: string; attendee: GetAttendee }>(),
    deleteAttendeeSuccess: type<{ attendee: GetAttendee }>(),
    deleteAttendeeFailure: type<{ error: string; attendee: GetAttendee }>(),

    paginate: type<{ page: number; limit: number }>(),

    resetStore: type<void>(),
  },
});
