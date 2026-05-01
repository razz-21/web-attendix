import { z } from "zod";

export const WorkspaceSchema = z.object({
  id: z.uuidv4().default(crypto.randomUUID()),
  name: z.string(),
  description: z.string().optional(),
  avatar: z.string(),
  created_at: z.iso.datetime().default(new Date().toISOString()),
  updated_at: z.iso.datetime().default(new Date().toISOString()),
});

export const GetWorkspaceSchema = WorkspaceSchema.extend({ total_users: z.number(), total_groups: z.number() });
export const PostWorkspaceSchema = WorkspaceSchema;
export const PatchWorkspaceSchema = WorkspaceSchema.omit({ id: true, created_at: true }).partial();
export const DeleteWorkspaceSchema = WorkspaceSchema.pick({ id: true });
export const GetPaginatedWorkspaceParamsSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  q: z.string().optional(),
});
export const GetPaginatedWorkspaceSchema = z.object({
  data: z.array(GetWorkspaceSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});