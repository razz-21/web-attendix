import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';
import { GetPaginatedUsers, GetUser, PostUser } from '@/app/types/users/users.type';

export const UsersEvents = eventGroup({
  source: 'Users Page',
  events: {
    loadUsers: type<void>(),
    loadUsersSuccess: type<GetPaginatedUsers>(),
    loadUsersFailure: type<string>(),

    searchUsers: type<{ q: string }>(),
    searchUsersSuccess: type<GetPaginatedUsers>(),
    searchUsersFailure: type<string>(),

    filterUsers: type<{ status?: string, role?: string }>(),
    filterUsersSuccess: type<GetPaginatedUsers>(),
    filterUsersFailure: type<string>(),
    
    paginateUsers: type<{ page: number, limit: number }>(),
    paginateUsersSuccess: type<GetPaginatedUsers>(),
    paginateUsersFailure: type<string>(),

    createUser: type<{ user: PostUser }>(),
    createUserSuccess: type<GetUser>(),
    createUserFailure: type<string>(),

    deleteUser: type<{ user: GetUser }>(),
    deleteUserSuccess: type<{ user: GetUser }>(),
    deleteUserFailure: type<{ error: string, user: GetUser }>(),

    resetStore: type<void>(),
  },
});