import { z } from "zod";
import {
  AttendanceRecordSchema,
  GetAttendanceRecordSchema,
  PostAttendanceRecordSchema,
  PatchAttendanceRecordSchema,
  GetAttendanceRecordsQuerySchema,
} from "./attendance-records.schema";

export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>;
export type GetAttendanceRecord = z.infer<typeof GetAttendanceRecordSchema>;
export type PostAttendanceRecord = z.infer<typeof PostAttendanceRecordSchema>;
export type PatchAttendanceRecord = z.infer<typeof PatchAttendanceRecordSchema>;
export type GetAttendanceRecordsQuery = z.infer<typeof GetAttendanceRecordsQuerySchema>;