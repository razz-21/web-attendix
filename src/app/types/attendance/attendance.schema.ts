import { z } from "zod";

export const AttendanceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  attendance_date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  attendance_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const GetAttendanceSchema = AttendanceSchema;
export const PostAttendanceSchema = AttendanceSchema;
export const PatchAttendanceSchema = AttendanceSchema.omit({ id: true, created_at: true }).partial();
export const GetAttendanceQuerySchema = z.object({
  q: z.string().optional(),
});