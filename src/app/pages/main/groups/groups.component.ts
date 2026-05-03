import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import type { GetGroup } from '@/app/types/groups/groups.type';
import { GroupFormModalComponent } from './group-form-modal/group-form-modal.component';
import { GroupTableComponent } from './group-table/group-table.component';
import { GroupsEvents } from '@/app/store/groups/groups.events';
import { Dispatcher } from '@ngrx/signals/events';
import { GroupsStore } from '@/app/store/groups/groups.store';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss',
  imports: [MatButtonModule, GroupTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupsComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly dispatcher = inject(Dispatcher);
  private readonly groupsStore = inject(GroupsStore);

  public readonly hasGroups = computed(() => this.groupsStore.hasGroups());

  public ngOnInit(): void {
    this.dispatcher.dispatch(GroupsEvents.loadGroups());
  }

  public openAddGroup(): void {
    this.dialog.open<GroupFormModalComponent, undefined, GetGroup | undefined>(GroupFormModalComponent, {
      maxWidth: '620px',
      width: '100%',
      height: 'auto',
      autoFocus: 'first-tabbable',
    });
  }
}