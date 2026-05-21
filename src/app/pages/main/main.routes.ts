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
import { HomeComponent } from "./home/home.component";
import { roleGuard } from '@/app/guards/role.guard';

export const mainRoutes: Routes = [
  {
    path: 'main',
    component: MainComponent,
    children: [
      // {
      //   path: 'dashboard',
      //   component: DashboardComponent
      // },
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'attendances',
        component: AttendancesComponent,
        canActivate: [roleGuard(['admin', 'user'])]
      },
      {
        path: 'attendances/:id',
        loadChildren: () => import('./attendance-details/attendance-details.module').then(m => m.AttendanceDetailsModule),
        canActivate: [roleGuard(['admin', 'user'])]
      },
      {
        path: 'groups',
        component: GroupsComponent,
        canActivate: [roleGuard(['admin', 'user'])]
      },
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'groups/:id/members', 
        component: GroupMemberComponent,
        canActivate: [roleGuard(['admin', 'user'])]
      },
      {
        path: 'users/:id',
        component: UserDetailsComponent,
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [roleGuard(['admin', 'user'])]
      },
      {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'workspaces',
        component: WorkspacesComponent,
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'workspaces/:id',
        component: WorkspaceDetailsComponent,
        canActivate: [roleGuard(['admin'])]
      }
    ]
  }
]; 

export default mainRoutes;