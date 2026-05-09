import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';
import { GetAttendance, PostAttendance, PatchAttendance } from '@/app/types/attendance/attendance.types';

export const AttendanceEvents = eventGroup({
  source: 'Attendance Page',
  events: {
    loadAttendance: type<{ attendance_id: string }>(),
    loadAttendanceSuccess: type<GetAttendance[]>(),
    loadAttendanceFailure: type<string>(),

    searchAttendance: type<{ q: string }>(),
    searchAttendanceSuccess: type<GetAttendance[]>(),
    searchAttendanceFailure: type<string>(),

    createAttendance: type<{ attendance_id: string; attendance: PostAttendance }>(),
    createAttendanceSuccess: type<GetAttendance>(),
    createAttendanceFailure: type<string>(),

    updateAttendance: type<{ attendance_id: string; id: string; data: PatchAttendance }>(),
    updateAttendanceSuccess: type<GetAttendance>(),
    updateAttendanceFailure: type<string>(),

    deleteAttendance: type<{ attendance_id: string; attendance: GetAttendance }>(),
    deleteAttendanceSuccess: type<{ attendance: GetAttendance }>(),
    deleteAttendanceFailure: type<{ error: string; attendance: GetAttendance }>(),

    resetStore: type<void>(),
  },
});