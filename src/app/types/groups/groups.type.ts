import { z } from "zod";
import { GroupSchema, GetGroupSchema, GetPaginatedGroupParamsSchema, GetPaginatedGroupsSchema, PostGroupSchema, PatchGroupSchema, DeleteGroupSchema, } from "./groups.schema";

export type Group = z.infer<typeof GroupSchema>;
export type GetGroup = z.infer<typeof GetGroupSchema>;
export type GetPaginatedGroupParams = z.infer<typeof GetPaginatedGroupParamsSchema>;
export type GetPaginatedGroups = z.infer<typeof GetPaginatedGroupsSchema>;
export type PostGroup = z.infer<typeof PostGroupSchema>;
export type PatchGroup = z.infer<typeof PatchGroupSchema>;
export type DeleteGroup = z.infer<typeof DeleteGroupSchema>;