import { WorkspaceDetailsEvents } from "@/app/store/workspace-details/workspace-details.events";
import { WorkspaceDetailsStore } from "@/app/store/workspace-details/workspace-details.store";
import { Component, computed, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { ActivatedRoute, Router } from "@angular/router";
import { Dispatcher } from "@ngrx/signals/events";
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from "@angular/material/list";
import { AvatarComponent } from "@/app/compponents/avatar/avatar.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatCardModule } from "@angular/material/card";
import { LoadingSectionComponent } from "@/app/compponents/loading-section/loading-section.component";
import { UpdateWorkspaceDetailsDialogFormComponent } from "./update-workspace-details-dialog-form/update-workspace-details-dialog-form.component";
import { MAIN_WORKSPACES_PATH } from "@/app/constants/route.constant";
import { AddWorkspaceUserComponent } from "./add-workspace-user/add-workspace-user.component";
import { GetUser } from "@/app/types/users/users.type";
import { GetGroup } from "@/app/types/groups/groups.type";

@Component({
  selector: 'app-workspace-details',
  templateUrl: './workspace-details.component.html',
  styleUrls: ['./workspace-details.component.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatListModule,
    MatTooltipModule,
    MatCardModule,
    AvatarComponent,
    LoadingSectionComponent
]
})
export class WorkspaceDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly dispatcher = inject(Dispatcher);
  private readonly workspaceDetailsStore = inject(WorkspaceDetailsStore);

  public workspace = computed(() => this.workspaceDetailsStore.workspace());

  public loadingWorkspace = computed(() => this.workspaceDetailsStore.loading());

  public users = computed(() => this.workspaceDetailsStore.users());

  public loadingUsers = computed(() => this.workspaceDetailsStore.loadingUsers());

  public emptyUsers = computed(() => this.users().length === 0);

  public totalUsers = computed(() => this.users().length);

  public groups = computed(() => this.workspaceDetailsStore.groups());
  public loadingGroups = computed(() => this.workspaceDetailsStore.loadingGroups());
  public emptyGroups = computed(() => this.groups().length === 0);
  public totalGroups = computed(() => this.groups().length);

  public ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.dispatcher.dispatch(WorkspaceDetailsEvents.loadWorkspaceDetails({ id }));
      this.dispatcher.dispatch(WorkspaceDetailsEvents.loadWorkspaceUsers({ id }));
      this.dispatcher.dispatch(WorkspaceDetailsEvents.loadWorkspaceGroups({ id }));
    }
  }

  public deleteWorkspace(): void {
    this.dispatcher.dispatch(WorkspaceDetailsEvents.deleteWorkspace({ workspace: this.workspace()! }));
  }

  public openUpdateWorkspaceDialog(): void {
    this.dialog.open(UpdateWorkspaceDetailsDialogFormComponent, {
      maxWidth: '620px',
      width: '100%',
      height: 'auto',
      autoFocus: 'first-tabbable',
    });
  }

  public inviteUser(): void {
    this.dialog.open(AddWorkspaceUserComponent, {
      maxWidth: '620px',
      width: '100%',
      height: 'auto',
      autoFocus: 'first-tabbable',
    });
  }

  public removeWorkspaceUsers(user: GetUser): void {
    this.dispatcher.dispatch(WorkspaceDetailsEvents.removeWorkspaceUser({ user }));
  }

  public navigateBack(): void {
    this.router.navigate([MAIN_WORKSPACES_PATH]);
  }

  public viewGroup(group: GetGroup): void {
    this.router.navigate(['/main/groups', group.id, 'members']);
  }
}