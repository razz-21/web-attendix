import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';
import { GetPaginatedGroups, GetGroup, PostGroup, PatchGroup  } from '@/app/types/groups/groups.type';

export const GroupsEvents = eventGroup({
  source: 'Groups Page',
  events: {
    loadGroups: type<void>(),
    loadGroupsSuccess: type<GetPaginatedGroups>(),
    loadGroupsFailure: type<string>(),

    searchGroups: type<{ q: string }>(),
    searchGroupsSuccess: type<GetPaginatedGroups>(),
    searchGroupsFailure: type<string>(),

    filterGroups: type<{ department?: string }>(),
    filterGroupsSuccess: type<GetPaginatedGroups>(),
    filterGroupsFailure: type<string>(),

    paginateGroups: type<{ page: number, limit: number }>(),
    paginateGroupsSuccess: type<GetPaginatedGroups>(),
    paginateGroupsFailure: type<string>(),

    createGroup: type<{ group: PostGroup }>(),
    createGroupSuccess: type<GetGroup>(),
    createGroupFailure: type<string>(),

    updateGroup: type<{ id: string; group: PatchGroup }>(), 
    updateGroupSuccess: type<GetGroup>(),                  
    updateGroupFailure: type<string>(),    

    deleteGroup: type<{ group: GetGroup }>(),
    deleteGroupSuccess: type<{ group: GetGroup }>(),
    deleteGroupFailure: type<{ error: string, group: GetGroup }>(),

    clearFilters: type<void>(),
    resetStore: type<void>(),
  },
});