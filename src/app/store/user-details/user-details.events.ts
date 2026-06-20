import { type } from "@ngrx/signals";
import { eventGroup } from "@ngrx/signals/events";
import { GetUser, PatchUser, UserErrorResponse } from "@/app/types/users/users.type";

export const UserDetailsEvents = eventGroup({
  source: 'User Details Page',
  events: {
    loadUserDetails: type<{ id: string }>(),
    loadUserDetailsSuccess: type<{ user: GetUser }>(),
    loadUserDetailsFailure: type<UserErrorResponse>(),

    updateUserDetails: type<{ payload: PatchUser }>(),
    updateUserDetailsSuccess: type<{ user: GetUser }>(),
    updateUserDetailsFailure: type<UserErrorResponse>(),

    approveUser: type<{ user: GetUser }>(),
    approveUserSuccess: type<{ user: GetUser }>(),
    approveUserFailure: type<UserErrorResponse>(),

    deleteUser: type<{ user: GetUser }>(),
    deleteUserSuccess: type<boolean>(),
    deleteUserFailure: type<UserErrorResponse>(),
  },
});