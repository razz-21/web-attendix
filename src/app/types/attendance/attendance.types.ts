import { z } from "zod";
import {
  AttendanceSchema,
  AttendanceStatusSchema,
  GetAttendanceSchema,
  PostAttendanceSchema,
  PatchAttendanceSchema,
  GetAttendanceQuerySchema,
} from "./attendance.schema";

export type Attendance = z.infer<typeof AttendanceSchema>;
export type AttendanceStatus = z.infer<typeof AttendanceStatusSchema>;
export type GetAttendance = z.infer<typeof GetAttendanceSchema>;
export type PostAttendance = z.infer<typeof PostAttendanceSchema>;
export type PatchAttendance = z.infer<typeof PatchAttendanceSchema>;
export type GetAttendanceQuery = z.infer<typeof GetAttendanceQuerySchema>;