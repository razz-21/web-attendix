import { z } from "zod";
import { AttendanceRecordReasonTypeSchema, AttendanceRecordSchema, AttendanceRecordStatusSchema, PatchAttendanceRecordSchema, DeleteAttendanceRecordSchema, PostAttendanceRecordSchema, GetAttendanceRecordSchema } from "./attendance-record.schema";

export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>;
export type AttendanceRecordStatus = z.infer<typeof AttendanceRecordStatusSchema>;
export type AttendanceRecordReasonType = z.infer<typeof AttendanceRecordReasonTypeSchema>;
export type GetAttendanceRecord = z.infer<typeof GetAttendanceRecordSchema>;
export type PostAttendanceRecord = z.infer<typeof PostAttendanceRecordSchema>;
export type PatchAttendanceRecord = z.infer<typeof PatchAttendanceRecordSchema>;
export type DeleteAttendanceRecord = z.infer<typeof DeleteAttendanceRecordSchema>;