import { z } from "zod";
import {
  AttendanceSchema,
  GetAttendanceSchema,
  PostAttendanceSchema,
  PatchAttendanceSchema,
  GetAttendanceQuerySchema,
} from "./attendance.schema";

export type AttendanceRecord = z.infer<typeof AttendanceSchema>;
export type GetAttendanceRecord = z.infer<typeof GetAttendanceSchema>;
export type PostAttendanceRecord = z.infer<typeof PostAttendanceSchema>;
export type PatchAttendanceRecord = z.infer<typeof PatchAttendanceSchema>;
export type GetAttendanceRecordsQuery = z.infer<typeof GetAttendanceQuerySchema>;