import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';
import { GetPaginatedUsers, GetUser, PostUser } from '@/app/types/users/users.type';

export const UsersEvents = eventGroup({
  source: 'Users Page',
  events: {
    loadUsers: type<void>(),
    loadUsersSuccess: type<GetPaginatedUsers>(),
    loadUsersFailure: type<string>(),

    createUser: type<{ user: PostUser }>(),
    createUserSuccess: type<GetUser>(),
    createUserFailure: type<string>(),

    deleteUser: type<{ user: GetUser }>(),
    deleteUserSuccess: type<{ user: GetUser }>(),
    deleteUserFailure: type<{ error: string, user: GetUser }>(),

    resetStore: type<void>(),
  },
});