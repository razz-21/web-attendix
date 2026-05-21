import { Component, computed, inject } from "@angular/core";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { MAIN_ATTENDANCES_PATH, MAIN_DASHBOARD_PATH, MAIN_GROUPS_PATH, MAIN_HOME_PATH, MAIN_PROFILE_PATH, MAIN_SETTINGS_PATH, MAIN_USERS_PATH, MAIN_WORKSPACES_PATH } from "@/app/constants/route.constant";
import { Dispatcher } from "@ngrx/signals/events";
import { AuthEvents } from "@/app/store/auth/auth.events";
import { AuthStore } from "@/app/store/auth/auth.store";

@Component({
  selector: 'app-main-sidebar',
  templateUrl: './main-sidebar.component.html',
  styleUrl: './main-sidebar.component.scss',
  imports: [MatListModule, MatIconModule, RouterLink, RouterLinkActive]
})
export class MainSidebarComponent {
  private readonly dispatcher = inject(Dispatcher);
  private readonly authStore = inject(AuthStore);

  public readonly allRoutes = [
    // {
    //   path: MAIN_DASHBOARD_PATH,
    //   label: 'Dashboard',
    //   icon: 'dashboard'
    // },
    {
      path: MAIN_HOME_PATH,
      label: 'Home',
      icon: 'home',
      roles: ['admin', 'user']
    },
    {
      path: MAIN_ATTENDANCES_PATH,
      label: 'Attendances',
      icon: 'article_person',
      roles: ['admin', 'user']
    },
    {
      path: MAIN_GROUPS_PATH,
      label: 'Groups',
      icon: 'crowdsource',
      roles: ['admin', 'user']
    },
    {
      path: MAIN_USERS_PATH,
      label: 'Users',
      icon: 'groups_2',
      roles: ['admin']
    },
    {
      path: MAIN_PROFILE_PATH,
      label: 'Profile',
      icon: 'person',
      roles: ['admin', 'user']
    },
    {
      path: MAIN_WORKSPACES_PATH,
      label: 'Workspaces',
      icon: 'workspace',
      roles: ['admin']
    },
    {
      path: MAIN_SETTINGS_PATH,
      label: 'Settings',
      icon: 'settings',
      roles: ['admin']
    }
  ]

   public readonly routes = computed(() => {
    const role = this.authStore.user()?.role;
    return this.allRoutes.filter(route => route.roles.includes(role ?? ''));
  });

  public logout(): void {
    this.dispatcher.dispatch(AuthEvents.logout());
  }
}