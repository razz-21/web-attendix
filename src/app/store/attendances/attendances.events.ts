import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';
import { BackendAttendance, CreateAttendancePayload } from '@/app/services/attendances.service';

export const AttendancesEvents = eventGroup({
  source: 'Attendances Page',
  events: {
    loadAttendances: type<void>(),
    loadAttendancesSuccess: type<BackendAttendance[]>(),
    loadAttendancesFailure: type<string>(),

    createAttendance: type<CreateAttendancePayload>(),
    createAttendanceSuccess: type<BackendAttendance>(),
    createAttendanceFailure: type<string>(),

    updateAttendance: type<{ id: string; data: Partial<CreateAttendancePayload> }>(),
    updateAttendanceSuccess: type<BackendAttendance>(),
    updateAttendanceFailure: type<string>(),

    deleteAttendance: type<string>(),
    deleteAttendanceSuccess: type<string>(),
    deleteAttendanceFailure: type<string>(),
  },
});
