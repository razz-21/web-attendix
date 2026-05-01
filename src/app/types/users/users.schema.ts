import { z } from "zod";

export const UserStatusSchema = z.enum(['active', 'inactive', 'needs_verification']);
export const UserRoleSchema = z.enum(['admin', 'user']);

export const UserSchema = z.object({
  id: z.uuidv4(),
  rfid: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  email: z.string(),
  department: z.string(),
  role: UserRoleSchema.default('user'),
  username: z.string(),
  password: z.string(),
  status: UserStatusSchema.default('needs_verification'),
  workspace_id: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const GetUserSchema = UserSchema.omit({ password: true });
export const GetPaginatedUserParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  q: z.string().optional(),
  status: UserStatusSchema.optional(),
  role: UserRoleSchema.optional()
})
export const GetPaginatedUsersSchema = z.object({
  data: z.array(GetUserSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});
export const PostUserSchema = UserSchema;
export const PatchUserSchema = UserSchema.omit({ id: true, updated_at: true }).partial();
export const DeleteUserSchema = z.object({
  id: z.string(),
});
export const UserErrorResponseSchema = z.object({
  status_code: z.number(),
  message: z.string(),
});