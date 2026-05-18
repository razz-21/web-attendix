import { z } from "zod";

export const GroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  workspace_id: z.string().uuid().optional().nullable(),
  created_by: z.string().uuid().optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const GetGroupSchema = GroupSchema;
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
export const PostGroupSchema = GroupSchema.omit({ updated_at: true });
export const PatchGroupSchema = PostGroupSchema.partial();
export const DeleteGroupSchema = z.object({ id: z.string() });