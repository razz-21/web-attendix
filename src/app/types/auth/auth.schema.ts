import { z } from "zod";
import { UserSchema } from "../users/users.schema";

export const TokenPayloadSchema = z.object({
  user: UserSchema.omit({ password: true }),
  exp: z.number(),
});

export const EmailLoginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export const EmailLoginResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  payload: TokenPayloadSchema
});

export const PatchProfileSchema = UserSchema.omit({ id: true, updated_at: true }).partial();

export const PatchPasswordSchema = z.object({ 
  current_password: z.string(),
  new_password: z.string(),
  confirm_new_password: z.string(),
});

export const AuthErrorResponseSchema = z.object({
  status_code: z.number(),
  message: z.string(),
});

export const PostRequestAccountSchema = UserSchema.pick({
  id: true,
  rfid: true,
  firstname: true,
  lastname: true,
  email: true,
  department: true,
  username: true,
  password: true,
});