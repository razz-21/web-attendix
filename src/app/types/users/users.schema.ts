import { z } from "zod";

export const UserStatusSchema = z.enum(['active', 'inactive', 'needs_verification']);

export const UserSchema = z.object({
  id: z.uuidv4(),
  rfid: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  department: z.string(),
  username: z.string(),
  password: z.string(),
  status: UserStatusSchema.default('needs_verification'),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const GetUserSchema = UserSchema.omit({ password: true });
export const GetPaginatedUsersSchema = z.object({
  data: z.array(GetUserSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});
export const PostUserSchema = UserSchema.omit({ id: true });
export const PatchUserSchema = UserSchema.omit({ id: true, updatedAt: true }).partial();
export const DeleteUserSchema = z.object({
  id: z.uuidv4(),
});