import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';
import { GetAttendance, PostAttendance, PatchAttendance } from '@/app/types/attendance/attendance.types';

export const AttendanceEvents = eventGroup({
  source: 'Attendance Records Page',
  events: {
    loadAttendanceRecords: type<{ attendance_id: string }>(),
    loadAttendanceRecordsSuccess: type<GetAttendance[]>(),
    loadAttendanceRecordsFailure: type<string>(),

    searchAttendanceRecords: type<{ q: string }>(),
    searchAttendanceRecordsSuccess: type<GetAttendance[]>(),
    searchAttendanceRecordsFailure: type<string>(),

    createAttendanceRecord: type<{ attendance_id: string; record: PostAttendance }>(),
    createAttendanceRecordSuccess: type<GetAttendance>(),
    createAttendanceRecordFailure: type<string>(),

    updateAttendanceRecord: type<{ attendance_id: string; id: string; data: PatchAttendance }>(),
    updateAttendanceRecordSuccess: type<GetAttendance>(),
    updateAttendanceRecordFailure: type<string>(),

    deleteAttendanceRecord: type<{ attendance_id: string; record: GetAttendance }>(),
    deleteAttendanceRecordSuccess: type<{ record: GetAttendance }>(),
    deleteAttendanceRecordFailure: type<{ error: string; record: GetAttendance }>(),

    resetStore: type<void>(),
  },
});