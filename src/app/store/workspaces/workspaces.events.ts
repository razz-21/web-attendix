import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';
import {
  GetPaginatedWorkspace,
  GetWorkspace,
  PatchWorkspace,
  PostWorkspace,
} from '@/app/types/workspaces/workspaces.types';

export const WorkspacesEvents = eventGroup({
  source: 'Workspaces Page',
  events: {
    loadWorkspaces: type<void>(),
    loadWorkspacesSuccess: type<GetPaginatedWorkspace>(),
    loadWorkspacesFailure: type<string>(),

    loadMoreWorkspaces: type<void>(),
    loadMoreWorkspacesSuccess: type<GetPaginatedWorkspace>(),
    loadMoreWorkspacesFailure: type<string>(),

    searchWorkspaces: type<{ q: string }>(),
    searchWorkspacesSuccess: type<GetPaginatedWorkspace>(),
    searchWorkspacesFailure: type<string>(),

    createWorkspace: type<{ workspace: PostWorkspace }>(),
    createWorkspaceSuccess: type<GetWorkspace>(),
    createWorkspaceFailure: type<string>(),

    updateWorkspace: type<{ id: string; workspace: PatchWorkspace }>(),
    updateWorkspaceSuccess: type<GetWorkspace>(),
    updateWorkspaceFailure: type<string>(),

    deleteWorkspace: type<{ workspace: GetWorkspace }>(),
    deleteWorkspaceSuccess: type<{ workspace: GetWorkspace }>(),
    deleteWorkspaceFailure: type<{ error: string, workspace: GetWorkspace }>(),

    resetStore: type<void>(),
  },
});
