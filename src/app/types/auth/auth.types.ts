import { EmailLoginSchema, EmailLoginResponseSchema, TokenPayloadSchema } from "./auth.schema";
import { z } from "zod";

export type EmailLogin = z.infer<typeof EmailLoginSchema>;
export type EmailLoginResponse = z.infer<typeof EmailLoginResponseSchema>;
export type TokenPayload = z.infer<typeof TokenPayloadSchema>;