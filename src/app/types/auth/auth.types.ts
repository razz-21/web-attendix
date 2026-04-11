import { EmailLoginSchema, EmailLoginResponseSchema, TokenPayloadSchema, PatchProfileSchema, AuthErrorResponseSchema, PatchPasswordSchema } from "./auth.schema";
import { z } from "zod";

export type EmailLogin = z.infer<typeof EmailLoginSchema>;
export type EmailLoginResponse = z.infer<typeof EmailLoginResponseSchema>;
export type TokenPayload = z.infer<typeof TokenPayloadSchema>;
export type PatchProfile = z.infer<typeof PatchProfileSchema>;
export type PatchPassword = z.infer<typeof PatchPasswordSchema>;
export type AuthErrorResponse = z.infer<typeof AuthErrorResponseSchema>;