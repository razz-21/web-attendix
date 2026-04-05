import { Component } from "@angular/core";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { MAIN_ATTENDANCES_PATH, MAIN_DASHBOARD_PATH, MAIN_GROUPS_PATH, MAIN_PROFILE_PATH, MAIN_SETTINGS_PATH, MAIN_USERS_PATH } from "@/app/constants/route.constant";

@Component({
  selector: 'app-main-sidebar',
  templateUrl: './main-sidebar.component.html',
  styleUrl: './main-sidebar.component.scss',
  imports: [MatListModule, MatIconModule, RouterLink, RouterLinkActive]
})
export class MainSidebarComponent {
  public readonly routes = [
    {
      path: MAIN_DASHBOARD_PATH,
      label: 'Dashboard',
      icon: 'dashboard'
    },
    {
      path: MAIN_ATTENDANCES_PATH,
      label: 'Attendances',
      icon: 'article_person'
    },
    {
      path: MAIN_GROUPS_PATH,
      label: 'Groups',
      icon: 'crowdsource'
    },
    {
      path: MAIN_USERS_PATH,
      label: 'Users',
      icon: 'groups_2'
    },
    {
      path: MAIN_PROFILE_PATH,
      label: 'Profile',
      icon: 'person'
    },
    {
      path: MAIN_SETTINGS_PATH,
      label: 'Settings',
      icon: 'settings'
    }
  ]
}