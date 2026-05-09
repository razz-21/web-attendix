import { GetAttendance, PatchAttendance } from "@/app/types/attendaces/attendances.types";
import { type } from "@ngrx/signals";
import { eventGroup } from "@ngrx/signals/events";

export const AttendanceDetailsEvents = eventGroup({
  source: 'Attendance Details',
  events: {
    loadAttendanceDetails: type<{ id: string }>(),
    loadAttendanceDetailsSuccess: type<{ attendance: GetAttendance }>(),
    loadAttendanceDetailsFailure: type<string>(),

    updateAttendanceDetails: type<{ id: string; payload: PatchAttendance }>(),
    updateAttendanceDetailsSuccess: type<{ attendance: GetAttendance }>(),
    updateAttendanceDetailsFailure: type<string>(),

    deleteAttendanceDetails: type<{ id: string }>(),
    deleteAttendanceDetailsSuccess: type<void>(),
    deleteAttendanceDetailsFailure: type<string>(),
  },
});