import { z } from "zod";
import { WorkspaceSchema, GetWorkspaceSchema, PostWorkspaceSchema, PatchWorkspaceSchema, DeleteWorkspaceSchema, GetPaginatedWorkspaceParamsSchema, GetPaginatedWorkspaceSchema } from "./workspaces.schema";

export type Workspace = z.infer<typeof WorkspaceSchema>;
export type GetWorkspace = z.infer<typeof GetWorkspaceSchema>;
export type PostWorkspace = z.infer<typeof PostWorkspaceSchema>;
export type PatchWorkspace = z.infer<typeof PatchWorkspaceSchema>;
export type DeleteWorkspace = z.infer<typeof DeleteWorkspaceSchema>;
export type GetPaginatedWorkspaceParams = z.infer<typeof GetPaginatedWorkspaceParamsSchema>;
export type GetPaginatedWorkspace = z.infer<typeof GetPaginatedWorkspaceSchema>;