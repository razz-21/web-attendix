import { AuthErrorResponse, EmailLogin, EmailLoginResponse, PatchPassword } from "@/app/types/auth/auth.types";
import { GetUser, PatchUser } from "@/app/types/users/users.type";
import { type } from "@ngrx/signals";
import { eventGroup } from "@ngrx/signals/events";

export const AuthEvents = eventGroup({
  source: 'Auth',
  events: {
    emailLogin: type<EmailLogin>(),
    emailLoginSuccess: type<EmailLoginResponse>(),
    emailLoginFailure: type<AuthErrorResponse>(),

    logout: type<void>(),
    logoutSuccess: type<void>(),
    logoutFailure: type<{ message: string }>(),

    updateProfile: type<{ payload: PatchUser }>(),
    updateProfileSuccess: type<{ user: GetUser }>(),
    updateProfileFailure: type<AuthErrorResponse>(),

    updatePassword: type<{ payload: PatchPassword }>(),
    updatePasswordSuccess: type<{ success: boolean }>(),
    updatePasswordFailure: type<AuthErrorResponse>(),

    setUser: type<{ user: GetUser }>(),
  },
});