import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import type { GetGroupMember } from '@/app/types/group-members/group-members.type';
import type { GetGroup } from '@/app/types/groups/groups.type';
import { GroupMemberFormModalComponent } from './group-member-form-modal/group-member-form-modal.component';
import { GroupMemberTableComponent } from './group-member-table/group-member-table.component';
import { GroupMembersEvents } from '@/app/store/group-members/group-members.events';
import { GroupMembersStore } from '@/app/store/group-members/group-members.store';
import { Dispatcher } from '@ngrx/signals/events';
import { GroupEditModalComponent } from './group-edit-modal/group-edit-modal.component';
import { GroupImportModalComponent } from './group-import-modal/group-import-modal.component';
import { GroupsService } from '@/app/services/groups.service'; 

@Component({
  selector: 'app-group-member',
  templateUrl: './groups-member.component.html',
  styleUrl: './groups-member.component.scss',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, GroupMemberTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupMemberComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly dispatcher = inject(Dispatcher);
  private readonly groupMembersStore = inject(GroupMembersStore);
  private readonly groupsService = inject(GroupsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  public readonly hasMembers = computed(() => this.groupMembersStore.hasMembers());
  public readonly currentGroup = signal<GetGroup | undefined>(undefined);

  public async ngOnInit(): Promise<void> {
    const group_id = this.route.snapshot.paramMap.get('id')!;

    try {
      const group = await this.groupsService.getGroupById(group_id);
      this.currentGroup.set(group);
    } catch {
    }

    this.dispatcher.dispatch(GroupMembersEvents.loadGroupMembers({ group_id }));
  }

  public navigateToGroups(): void {
    this.router.navigate(['/main/groups']);
  }

  public openEditGroup(): void {
    const group = this.currentGroup();
    const groupId = this.route.snapshot.paramMap.get('id');
    if (!group || !groupId) return;
    const dialogRef = this.dialog.open(GroupEditModalComponent, {
      maxWidth: '620px',
      width: '100%',
      data: { group, groupId },
    });

    dialogRef.afterClosed().subscribe((updatedGroup: GetGroup | undefined) => {
      if (updatedGroup) {
        this.currentGroup.set(updatedGroup);
      }
    });
  }

  public openImportParticipant(): void {
    const group_id = this.route.snapshot.paramMap.get('id')!;
    this.dialog.open(GroupImportModalComponent, {
      maxWidth: '600px',
      width: '100%',
      disableClose: true,
      data: { group_id },
    });
  }

  public openAddMember(): void {
    this.dialog.open<GroupMemberFormModalComponent, undefined, GetGroupMember | undefined>(GroupMemberFormModalComponent, {
      maxWidth: '620px',
      width: '100%',
      height: 'auto',
      autoFocus: 'first-tabbable',
    });
  }
}