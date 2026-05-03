import z from "zod";
import { UserSchema } from "../users/users.schema";

export const AttendanceScheduleDaysSchema = z.array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']))

export const AttendanceStatusSchema = z.enum(['Active', 'Archived'])

export const AttendanceSchema = z.object({
  id: z.uuidv4(),
  name: z.string(),
  code: z.string(),
  description: z.string(),
  schedule_days: AttendanceScheduleDaysSchema,
  late_threshold: z.number(),
  status: AttendanceStatusSchema,
  created_by: z.uuidv4(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})

export const GetAttendanceSchema = AttendanceSchema.extend({
  created_by: UserSchema.pick({ id: true, firstname: true, lastname: true }),
});

export const GetPaginatedAttendancesSchema = z.object({
  data: z.array(GetAttendanceSchema),
  page: z.number().optional(),
  limit: z.number().optional(),
  total: z.number().optional(),
})

export const PostAttendanceSchema = AttendanceSchema;
export const PatchAttendanceSchema = AttendanceSchema.omit({ id: true, created_at: true }).partial()
export const DeleteAttendanceSchema = AttendanceSchema.pick({ id: true })
export const GetAttendancesQuerySchema = z.object({
  q: z.string().optional(),
})