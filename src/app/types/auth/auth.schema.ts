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