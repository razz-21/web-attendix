import { GetAttendanceRecord, PostAttendanceRecord, PatchAttendanceRecord } from "@/app/types/attendance-record/attendance-record.types";
import { type } from "@ngrx/signals";
import { eventGroup } from "@ngrx/signals/events";

export const AttendanceRecordEvents = eventGroup({
  source: 'Attendance Record Page',
  events: {
    loadAttendanceRecords: type<{ attendances_id: string }>(),
    loadAttendanceRecordsSuccess: type<GetAttendanceRecord[]>(),
    loadAttendanceRecordsFailure: type<string>(),

    createAttendanceRecord: type<{ attendances_id: string; payload: PostAttendanceRecord }>(),
    createAttendanceRecordSuccess: type<GetAttendanceRecord>(),
    createAttendanceRecordFailure: type<{ error: string; id: string }>(),

    updateAttendanceRecord: type<{ attendances_id: string; id: string; payload: PatchAttendanceRecord }>(),
    updateAttendanceRecordSuccess: type<GetAttendanceRecord>(),
    updateAttendanceRecordFailure: type<{ error: string; id: string }>(),

    resetStore: type<void>(),
  },
});