import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { MainComponent } from "./main.component";
import { ProfileComponent } from "./profile/profile.component";
import { SettingsComponent } from "./settings/settings.component";
import { AttendancesComponent } from "./attendances/attendances.component";
import { GroupsComponent } from "./groups/groups.component";
import { GroupMemberComponent } from "./groups/group-members/groups-member.component"; 
import { UsersComponent } from "./users/users.component";
import { UserDetailsComponent } from "./user-details/user-details.component";
import { WorkspacesComponent } from "./workspaces/workspaces.component";
import { WorkspaceDetailsComponent } from "./workspace-details/workspace-details.component";
import { AttendanceDetailsComponent } from "./attendance-details/attendance-details.component";

export const mainRoutes: Routes = [
  {
    path: 'main',
    component: MainComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'attendances',
        component: AttendancesComponent
      },
      {
        path: 'attendances/:id',
        loadChildren: () => import('./attendance-details/attendance-details.module').then(m => m.AttendanceDetailsModule)
      },
      {
        path: 'groups',
        component: GroupsComponent
      },
      {
        path: 'users',
        component: UsersComponent
      },
      {
        path: 'groups/:id/members', 
        component: GroupMemberComponent 
      },
      {
        path: 'users/:id',
        component: UserDetailsComponent
      },
      {
        path: 'profile',
        component: ProfileComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
      },
      {
        path: 'workspaces',
        component: WorkspacesComponent,
      },
      {
        path: 'workspaces/:id',
        component: WorkspaceDetailsComponent
      }
    ]
  }
]; 

export default mainRoutes;