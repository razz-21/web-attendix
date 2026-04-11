import { EmailLogin, EmailLoginResponse } from "@/app/types/auth/auth.types";
import { GetUser } from "@/app/types/users/users.type";
import { type } from "@ngrx/signals";
import { eventGroup } from "@ngrx/signals/events";

export const AuthEvents = eventGroup({
  source: 'Auth',
  events: {
    emailLogin: type<EmailLogin>(),
    emailLoginSuccess: type<EmailLoginResponse>(),
    emailLoginFailure: type<{ status_code: number, message: string }>(),

    logout: type<void>(),
    logoutSuccess: type<void>(),
    logoutFailure: type<{ message: string }>(),

    setUser: type<{ user: GetUser }>(),
  },
});