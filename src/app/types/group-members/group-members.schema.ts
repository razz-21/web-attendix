import { z } from "zod";

export const GroupMemberSchema = z.object({
  id: z.string().uuid(),
  rfid: z.string(),
  name: z.string(),
  department: z.string().optional(),
  year_level: z.string().optional(),
  section: z.string().optional(),
  group_type: z.enum(['student']).default('student'),
  group_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const GetGroupMemberSchema = GroupMemberSchema;
export const PostGroupMemberSchema = GroupMemberSchema.omit({ id: true, created_at: true, updated_at: true });
export const PatchGroupMemberSchema = PostGroupMemberSchema.partial();
export const GetPaginatedGroupMemberParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  q: z.string().optional(),
  department: z.string().optional(),
});
export const GetPaginatedGroupMembersSchema = z.object({
  data: z.array(GetGroupMemberSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});