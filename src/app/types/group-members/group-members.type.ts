import { z } from "zod";
import {
  GroupMemberSchema,
  GetGroupMemberSchema,
  PostGroupMemberSchema,
  PatchGroupMemberSchema,
  GetPaginatedGroupMemberParamsSchema,
  GetPaginatedGroupMembersSchema,
} from "./group-members.schema";

export type GroupMember = z.infer<typeof GroupMemberSchema>;
export type GetGroupMember = z.infer<typeof GetGroupMemberSchema>;
export type PostGroupMember = z.infer<typeof PostGroupMemberSchema>;
export type PatchGroupMember = z.infer<typeof PatchGroupMemberSchema>;
export type GetPaginatedGroupMemberParams = z.infer<typeof GetPaginatedGroupMemberParamsSchema>;
export type GetPaginatedGroupMembers = z.infer<typeof GetPaginatedGroupMembersSchema>;