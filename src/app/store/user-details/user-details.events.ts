import { type } from "@ngrx/signals";
import { eventGroup } from "@ngrx/signals/events";
import { GetUser, PatchUser } from "@/app/types/users/users.type";

export const UserDetailsEvents = eventGroup({
  source: 'User Details Page',
  events: {
    loadUserDetails: type<{ id: string }>(),
    loadUserDetailsSuccess: type<{ user: GetUser }>(),
    loadUserDetailsFailure: type<string>(),

    updateUserDetails: type<{ payload: PatchUser }>(),
    updateUserDetailsSuccess: type<{ user: GetUser }>(),
    updateUserDetailsFailure: type<string>(),
  },
});