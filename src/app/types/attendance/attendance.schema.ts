import { z } from "zod";

export const AttendanceStatusSchema = z.enum(['active', 'inactive']);

export const AttendanceSchema = z.object({
  id: z.uuidv4(),
  name: z.string().trim().min(1),
  attendance_date: z.string().trim().min(1),
  start_time: z.string().trim().min(1),
  end_time: z.string().trim().min(1),
  attendance_id: z.uuidv4(),
  attendances_id: z.uuidv4(),
  status: AttendanceStatusSchema.default('active'),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const GetAttendanceSchema = AttendanceSchema;
export const PostAttendanceSchema = AttendanceSchema;
export const PatchAttendanceSchema = AttendanceSchema.omit({ id: true, created_at: true }).partial();
export const GetAttendanceQuerySchema = z.object({
  q: z.string().optional(),
});