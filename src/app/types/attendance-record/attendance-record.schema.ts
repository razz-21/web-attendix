import z from "zod";

export const AttendanceRecordStatusSchema = z.enum(['present', 'late', 'excused', 'absent']);
export const AttendanceRecordReasonTypeSchema = z.enum(['sick', 'personal', 'excused', 'other']);

export const AttendanceRecordSchema = z.object({
  id: z.uuidv4(),
  attendances_id: z.uuidv4(),
  attendance_id: z.uuidv4(),
  attendee_id: z.uuidv4(),
  status: AttendanceRecordStatusSchema,
  reason_type: AttendanceRecordReasonTypeSchema.optional().nullable(),
  reason: z.string().optional().nullable(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const GetAttendanceRecordSchema = AttendanceRecordSchema;
export const PostAttendanceRecordSchema = AttendanceRecordSchema;
export const PatchAttendanceRecordSchema = AttendanceRecordSchema.omit({ id: true, created_at: true }).partial();
export const DeleteAttendanceRecordSchema = AttendanceRecordSchema.pick({ id: true });