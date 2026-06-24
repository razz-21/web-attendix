import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';
import { GetPaginatedGroupMembers, GetGroupMember, PostGroupMember, PatchGroupMember } from '@/app/types/group-members/group-members.type';

export const GroupMembersEvents = eventGroup({
  source: 'Group Members Page',
  events: {
    loadGroupMembers: type<{ group_id: string }>(),
    loadGroupMembersSuccess: type<GetPaginatedGroupMembers>(),
    loadGroupMembersFailure: type<string>(),

    searchGroupMembers: type<{ q: string }>(),
    searchGroupMembersSuccess: type<GetPaginatedGroupMembers>(),
    searchGroupMembersFailure: type<string>(),

    filterGroupMembers: type<{ department?: string }>(),
    filterGroupMembersSuccess: type<GetPaginatedGroupMembers>(),
    filterGroupMembersFailure: type<string>(),

    paginateGroupMembers: type<{ page: number; limit: number }>(),
    paginateGroupMembersSuccess: type<GetPaginatedGroupMembers>(),
    paginateGroupMembersFailure: type<string>(),

    importGroupMembers: type<{ group_id: string; members: PostGroupMember[] }>(),
    importGroupMembersSuccess: type<GetGroupMember[]>(),
    importGroupMembersFailure: type<string>(),

    createGroupMember: type<{ group_id: string; member: PostGroupMember }>(),
    createGroupMemberSuccess: type<GetGroupMember>(),
    createGroupMemberFailure: type<string>(),

    updateGroupMember: type<{ group_id: string; member_id: string; payload: PatchGroupMember }>(),
    updateGroupMemberSuccess: type<GetGroupMember>(),
    updateGroupMemberFailure: type<string>(),

    deleteGroupMember: type<{ group_id: string; member: GetGroupMember }>(),
    deleteGroupMemberSuccess: type<{ member: GetGroupMember }>(),
    deleteGroupMemberFailure: type<{ error: string; member: GetGroupMember }>(),

    toggleMemberSelection: type<{ member_id: string }>(),
    toggleAllMembersSelection: type<void>(),
    clearMemberSelection: type<void>(),

    bulkDeleteGroupMembers: type<{ group_id: string; members: GetGroupMember[] }>(),
    bulkDeleteGroupMembersSuccess: type<{ member_ids: string[] }>(),
    bulkDeleteGroupMembersFailure: type<{ error: string; members: GetGroupMember[] }>(),

    clearFilters: type<void>(),
    resetStore: type<void>(),
  },
});