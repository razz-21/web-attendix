import { z } from 'zod';
import {
  AttendeeSchema,
  GetAttendeeSchema,
  PostAttendeeSchema,
  PatchAttendeeSchema,
  GetPaginatedAttendeesSchema,
  GetAttendeesQuerySchema,
  ImportGroupBodySchema,
  ImportGroupResponseSchema,
} from './attendees.schema';

export type Attendee = z.infer<typeof AttendeeSchema>;
export type GetAttendee = z.infer<typeof GetAttendeeSchema>;
export type PostAttendee = z.infer<typeof PostAttendeeSchema>;
export type PatchAttendee = z.infer<typeof PatchAttendeeSchema>;
export type GetPaginatedAttendees = z.infer<typeof GetPaginatedAttendeesSchema>;
export type GetAttendeesQuery = z.infer<typeof GetAttendeesQuerySchema>;
export type ImportGroupBody = z.infer<typeof ImportGroupBodySchema>;
export type ImportGroupResponse = z.infer<typeof ImportGroupResponseSchema>;
