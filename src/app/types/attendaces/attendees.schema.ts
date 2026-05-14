import { z } from 'zod';

export const AttendeeSchema = z.object({
  id: z.string().uuid(),
  rfid: z.string().optional(),
  name: z.string(),
  department: z.string().optional(),
  year_level: z.string().optional(),
  section: z.string().optional(),
  attendance_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const GetAttendeeSchema = AttendeeSchema;

export const PostAttendeeSchema = AttendeeSchema.omit({ id: true, created_at: true, updated_at: true });
export const PatchAttendeeSchema = PostAttendeeSchema.partial();

export const GetPaginatedAttendeesSchema = z.object({
  data: z.array(GetAttendeeSchema),
  total: z.number(),
});

export const GetAttendeesQuerySchema = z.object({
  q: z.string().optional(),
});

export const ImportGroupBodySchema = z.object({
  group_id: z.string().uuid(),
});

export const ImportGroupResponseSchema = z.object({
  count: z.number(),
  message: z.string(),
});
