import { GetUser, User } from "@/app/types/users/users.type";
import { GetWorkspace, PatchWorkspace } from "@/app/types/workspaces/workspaces.types";
import { type } from "@ngrx/signals";
import { eventGroup } from "@ngrx/signals/events";

export const WorkspaceDetailsEvents = eventGroup({
  source: 'Workspace Details',
  events: {
    loadWorkspaceDetails: type<{ id: string }>(),
    loadWorkspaceDetailsSuccess: type<{ workspace: GetWorkspace }>(),
    loadWorkspaceDetailsFailure: type<string>(),

    loadWorkspaceUsers: type<{ id: string }>(),
    loadWorkspaceUsersSuccess: type<{ users: GetUser[] }>(),
    loadWorkspaceUsersFailure: type<string>(),

    deleteWorkspace: type<{ workspace: GetWorkspace }>(),
    deleteWorkspaceSuccess: type<boolean>(),
    deleteWorkspaceFailure: type<string>(),

    updateWorkspace: type<{ id: string; workspace: PatchWorkspace }>(),
    updateWorkspaceSuccess: type<{ workspace: GetWorkspace }>(),
    updateWorkspaceFailure: type<string>(),
  },
});