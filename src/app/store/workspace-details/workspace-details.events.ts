import { GetPaginatedUsers, GetUser, User } from "@/app/types/users/users.type";
import { GetWorkspace, PatchWorkspace } from "@/app/types/workspaces/workspaces.types";
import { type } from "@ngrx/signals";
import { eventGroup } from "@ngrx/signals/events";
import { GetGroup } from "@/app/types/groups/groups.type";

export const WorkspaceDetailsEvents = eventGroup({
  source: 'Workspace Details',
  events: {
    loadWorkspaceDetails: type<{ id: string }>(),
    loadWorkspaceDetailsSuccess: type<{ workspace: GetWorkspace }>(),
    loadWorkspaceDetailsFailure: type<string>(),

    loadWorkspaceUsers: type<{ id: string }>(),
    loadWorkspaceUsersSuccess: type<{ users: GetUser[] }>(),
    loadWorkspaceUsersFailure: type<string>(),

    loadWorkspaceGroups: type<{ id: string }>(),
    loadWorkspaceGroupsSuccess: type<{ groups: GetGroup[] }>(),
    loadWorkspaceGroupsFailure: type<string>(),

    removeWorkspaceUser: type<{ user: GetUser }>(),
    removeWorkspaceUserSuccess: type<{ userId: string }>(),
    removeWorkspaceUserFailure: type<string>(),

    addWorkspaceUsers: type<{ users: GetUser[] }>(),
    addWorkspaceUsersSuccess: type<{ users: GetUser[] }>(),
    addWorkspaceUsersFailure: type<string>(),

    deleteWorkspace: type<{ workspace: GetWorkspace }>(),
    deleteWorkspaceSuccess: type<boolean>(),
    deleteWorkspaceFailure: type<string>(),

    searchUsers: type<{ q: string }>(),
    searchUsersSuccess: type<GetPaginatedUsers>(),
    searchUsersFailure: type<string>(),

    updateWorkspace: type<{ id: string; workspace: PatchWorkspace }>(),
    updateWorkspaceSuccess: type<{ workspace: GetWorkspace }>(),
    updateWorkspaceFailure: type<string>(),

    resetStore: type<void>(),
  },
});