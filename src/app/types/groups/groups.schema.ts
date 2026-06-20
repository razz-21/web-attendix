import { z } from "zod";

export const GroupSchema = z.object({
  id: z.uuidv4(),
  name: z.string(),
  description: z.string().optional(),
  workspace_id: z.uuidv4().optional().nullable(),
  count_members: z.number(),
  created_by: z.uuidv4().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const GetGroupSchema = GroupSchema.extend({
  creator: z.object({
    id: z.string().uuid(),
    firstname: z.string(),
    lastname: z.string(),
    avatar: z.string().optional().nullable(),
  }).optional(),
});
export const GetPaginatedGroupParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  q: z.string().optional(),
  workspace_id: z.string().optional(),
});
export const GetPaginatedGroupsSchema = z.object({
  data: z.array(GetGroupSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});
export const PostGroupSchema = GroupSchema.omit({ updated_at: true, count_members: true });
export const PatchGroupSchema = PostGroupSchema.partial();
export const DeleteGroupSchema = z.object({ id: z.string() });