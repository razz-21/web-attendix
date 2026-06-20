import { MainSidebarComponent } from "@/app/compponents/main-sidebar/main-sidebar.component";
import { AttendanceAttendeeEvents } from "@/app/store/attendance-attendee/attendance-attendee.events";
import { AttendanceDetailsEvents } from "@/app/store/attendance-details/attendance-details.events";
import { AttendanceRecordEvents } from "@/app/store/attendance-record/attendance-record.events";
import { AttendanceEvents } from "@/app/store/attendance/attendance.events";
import { AttendancesEvents } from "@/app/store/attendances/attendances.events";
import { GroupMembersEvents } from "@/app/store/group-members/group-members.events";
import { GroupsEvents } from "@/app/store/groups/groups.events";
import { UsersEvents } from "@/app/store/users/users.events";
import { WorkspaceDetailsEvents } from "@/app/store/workspace-details/workspace-details.events";
import { WorkspacesEvents } from "@/app/store/workspaces/workspaces.events";
import { Component, inject, OnDestroy } from "@angular/core";
import { MatSidenavModule } from "@angular/material/sidenav";
import { RouterOutlet } from "@angular/router";
import { Dispatcher } from "@ngrx/signals/events";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  imports: [MatSidenavModule, MainSidebarComponent, RouterOutlet]
})
export class MainComponent implements OnDestroy {
  private readonly dispatcher = inject(Dispatcher);
  
  public ngOnDestroy(): void {
    this.dispatcher.dispatch(UsersEvents.resetStore());
    this.dispatcher.dispatch(GroupsEvents.resetStore());
    this.dispatcher.dispatch(GroupMembersEvents.resetStore());
    this.dispatcher.dispatch(AttendancesEvents.resetStore());
    this.dispatcher.dispatch(AttendanceEvents.resetStore());
    this.dispatcher.dispatch(AttendanceDetailsEvents.resetStore());
    this.dispatcher.dispatch(AttendanceAttendeeEvents.resetStore());
    this.dispatcher.dispatch(AttendanceRecordEvents.resetStore());
    this.dispatcher.dispatch(WorkspacesEvents.resetStore());
    this.dispatcher.dispatch(WorkspaceDetailsEvents.resetStore());
  }
}