import { z } from "zod";

export const AttendanceSchema = z.object({
  id: z.uuidv4(),
  name: z.string(),
  attendance_date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  attendance_id: z.uuidv4(),
  attendances_id: z.uuidv4(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const GetAttendanceSchema = AttendanceSchema;
export const PostAttendanceSchema = AttendanceSchema;
export const PatchAttendanceSchema = AttendanceSchema.omit({ id: true, created_at: true }).partial();
export const GetAttendanceQuerySchema = z.object({
  q: z.string().optional(),
});