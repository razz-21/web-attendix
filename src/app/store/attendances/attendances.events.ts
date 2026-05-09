import { AttendanceStatus, GetAttendance, GetPaginatedAttendances, PatchAttendance, PostAttendance } from '@/app/types/attendaces/attendances.types';
import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const AttendancesEvents = eventGroup({
  source: 'Attendances Page',
  events: {
    loadAttendances: type<void>(),
    loadAttendancesFromCache: type<void>(),
    loadAttendancesSuccess: type<GetAttendance[]>(),
    loadAttendancesFailure: type<string>(),

    searchAttendances: type<{ q: string }>(),
    searchAttendancesSuccess: type<GetAttendance[]>(),
    searchAttendancesFailure: type<string>(),

    filterAttendances: type<{ status: AttendanceStatus }>(),
    filterAttendancesSuccess: type<GetAttendance[]>(),
    filterAttendancesFailure: type<string>(),

    createAttendance: type<PostAttendance>(),
    createAttendanceSuccess: type<GetAttendance>(),
    createAttendanceFailure: type<string>(),

    updateAttendance: type<{ id: string; data: Partial<PatchAttendance> }>(),
    updateAttendanceSuccess: type<GetAttendance>(),
    updateAttendanceFailure: type<string>(),

    archiveAttendance: type<GetAttendance>(),
    archiveAttendanceSuccess: type<GetAttendance>(),
    archiveAttendanceFailure: type<{ error: string; attendance: GetAttendance }>(),

    setAttendanceAsActive: type<GetAttendance>(),
    setAttendanceAsActiveSuccess: type<GetAttendance>(),
    setAttendanceAsActiveFailure: type<{ error: string; attendance: GetAttendance }>(),

    deleteAttendance: type<GetAttendance>(),
    deleteAttendanceSuccess: type<GetAttendance>(),
    deleteAttendanceFailure: type<{ error: string, attendance: GetAttendance }>(),
  },
});
