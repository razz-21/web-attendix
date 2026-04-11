import { inject, Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { AuthStore } from "../store/auth/auth.store";
import { AuthService } from "../services/auth.service";
import { Dispatcher } from "@ngrx/signals/events";
import { AuthEvents } from "../store/auth/auth.events";
import { UserStatusSchema } from "../types/users/users.schema";
import { AUTH_LOGIN_PATH } from "../constants/route.constant";

@Injectable({
  providedIn: 'root'
})
export class MainGuard implements CanActivate {
  private readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly dispatcher = inject(Dispatcher);
  private readonly router = inject(Router);

  async canActivate(): Promise<boolean> {
    const user = await this.authService.getMe();
    this.dispatcher.dispatch(AuthEvents.setUser({ user }));

    const hasActiveUser = !!this.authStore.user();

    if (!hasActiveUser) {
      return this.router.navigate([AUTH_LOGIN_PATH]);
    }

    const isActive = user.status === UserStatusSchema.enum.active;
    if (!isActive) {
      return false;
    }

    return true;
  }
}