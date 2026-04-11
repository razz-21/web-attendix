import { z } from "zod";
import { DeleteUserSchema, UserSchema, GetUserSchema, GetPaginatedUsersSchema, PostUserSchema, PatchUserSchema, GetPaginatedUserParamsSchema, UserRoleSchema, UserStatusSchema, UserErrorResponseSchema } from "./users.schema";

export type User = z.infer<typeof UserSchema>;
export type GetUser = z.infer<typeof GetUserSchema>;
export type GetPaginatedUserParams = z.infer<typeof GetPaginatedUserParamsSchema>;
export type GetPaginatedUsers = z.infer<typeof GetPaginatedUsersSchema>;
export type PostUser = z.infer<typeof PostUserSchema>;
export type PatchUser = z.infer<typeof PatchUserSchema>;
export type DeleteUser = z.infer<typeof DeleteUserSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserStatus = z.infer<typeof UserStatusSchema>;
export type UserErrorResponse = z.infer<typeof UserErrorResponseSchema>;