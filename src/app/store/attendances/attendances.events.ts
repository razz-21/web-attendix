import { GetAttendance, GetPaginatedAttendances, PatchAttendance, PostAttendance } from '@/app/types/attendaces/attendances.types';
import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const AttendancesEvents = eventGroup({
  source: 'Attendances Page',
  events: {
    loadAttendances: type<void>(),
    loadAttendancesSuccess: type<GetAttendance[]>(),
    loadAttendancesFailure: type<string>(),

    createAttendance: type<PostAttendance>(),
    createAttendanceSuccess: type<GetAttendance>(),
    createAttendanceFailure: type<string>(),

    updateAttendance: type<{ id: string; data: Partial<PatchAttendance> }>(),
    updateAttendanceSuccess: type<GetAttendance>(),
    updateAttendanceFailure: type<string>(),

    deleteAttendance: type<GetAttendance>(),
    deleteAttendanceSuccess: type<GetAttendance>(),
    deleteAttendanceFailure: type<{ error: string, attendance: GetAttendance }>(),
  },
});
