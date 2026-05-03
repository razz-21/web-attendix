import { AttendanceSchema, GetAttendanceSchema, PostAttendanceSchema, PatchAttendanceSchema, DeleteAttendanceSchema, GetAttendancesQuerySchema, GetPaginatedAttendancesSchema, AttendanceScheduleDaysSchema } from "./attendances.schema";
import { z } from "zod"

export type AttendanceScheduleDays = z.infer<typeof AttendanceScheduleDaysSchema>
export type Attendance = z.infer<typeof AttendanceSchema>
export type GetAttendance = z.infer<typeof GetAttendanceSchema>
export type GetPaginatedAttendances = z.infer<typeof GetPaginatedAttendancesSchema>
export type PostAttendance = z.infer<typeof PostAttendanceSchema>
export type PatchAttendance = z.infer<typeof PatchAttendanceSchema>
export type DeleteAttendance = z.infer<typeof DeleteAttendanceSchema>
export type GetAttendancesQuery = z.infer<typeof GetAttendancesQuerySchema>