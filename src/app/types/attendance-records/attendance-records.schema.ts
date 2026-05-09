import { z } from "zod";

export const AttendanceRecordSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  attendance_date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  attendance_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const GetAttendanceRecordSchema = AttendanceRecordSchema;
export const PostAttendanceRecordSchema = AttendanceRecordSchema;
export const PatchAttendanceRecordSchema = AttendanceRecordSchema.omit({ id: true, created_at: true }).partial();
export const GetAttendanceRecordsQuerySchema = z.object({
  q: z.string().optional(),
});