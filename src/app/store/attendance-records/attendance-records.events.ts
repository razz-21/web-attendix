import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';
import { GetAttendanceRecord, PostAttendanceRecord, PatchAttendanceRecord } from '@/app/types/attendance-records/attendance-records.types';

export const AttendanceRecordsEvents = eventGroup({
  source: 'Attendance Records Page',
  events: {
    loadAttendanceRecords: type<{ attendance_id: string }>(),
    loadAttendanceRecordsSuccess: type<GetAttendanceRecord[]>(),
    loadAttendanceRecordsFailure: type<string>(),

    searchAttendanceRecords: type<{ q: string }>(),
    searchAttendanceRecordsSuccess: type<GetAttendanceRecord[]>(),
    searchAttendanceRecordsFailure: type<string>(),

    createAttendanceRecord: type<{ attendance_id: string; record: PostAttendanceRecord }>(),
    createAttendanceRecordSuccess: type<GetAttendanceRecord>(),
    createAttendanceRecordFailure: type<string>(),

    updateAttendanceRecord: type<{ attendance_id: string; id: string; data: PatchAttendanceRecord }>(),
    updateAttendanceRecordSuccess: type<GetAttendanceRecord>(),
    updateAttendanceRecordFailure: type<string>(),

    deleteAttendanceRecord: type<{ attendance_id: string; record: GetAttendanceRecord }>(),
    deleteAttendanceRecordSuccess: type<{ record: GetAttendanceRecord }>(),
    deleteAttendanceRecordFailure: type<{ error: string; record: GetAttendanceRecord }>(),

    resetStore: type<void>(),
  },
});