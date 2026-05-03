import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { GroupMembersStore } from '@/app/store/group-members/group-members.store';
import { GroupMembersEvents } from '@/app/store/group-members/group-members.events';
import { Dispatcher } from '@ngrx/signals/events';
import { GetGroupMember } from '@/app/types/group-members/group-members.type';
import { ConfirmationDialogService } from '@/app/services/confirmation-dialog.service';
import { DEPARTMENTS } from '@/app/constants/departments.constant';
import { UpdateMemberModalComponent } from './update-member-modal/update-member-modal.component';

@Component({
  selector: 'app-group-member-table',
  templateUrl: './group-member-table.component.html',
  styleUrl: './group-member-table.component.scss',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatPaginatorModule,
    FormsModule,
  ],
})
export class GroupMemberTableComponent {
  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  private readonly groupMembersStore = inject(GroupMembersStore);
  private readonly dispatcher = inject(Dispatcher);
  private readonly dialog = inject(MatDialog);

  protected readonly displayedColumns: string[] = [
    'rfid',
    'name',
    'department',
    'section',
    'year_level',
    'actions',
  ];
  protected readonly loadingRowColumns: string[] = ['loading'];

  public readonly loading = computed(() => this.groupMembersStore.loading());
  public readonly pagination = computed(() => this.groupMembersStore.pagination());
  public readonly filters = computed(() => this.groupMembersStore.filters());
  public readonly members = computed(() => this.groupMembersStore.members());
  public readonly data = computed(() => [...this.members()]);
  public readonly hasFilters = computed(() => this.groupMembersStore.hasFilters());

  public readonly departments = DEPARTMENTS;
  public readonly pageSizeOptions = [10, 25, 50];

  public editMember(row: GetGroupMember): void {
    this.dialog.open(UpdateMemberModalComponent, {
      maxWidth: '620px',
      width: '100%',
      height: 'auto',
      autoFocus: 'first-tabbable',
      data: row,
    });
  }

  public searchMembers(): void {
    this.dispatcher.dispatch(GroupMembersEvents.searchGroupMembers({ q: this.filters().q ?? '' }));
  }

  public filterMembersByDepartment(): void {
    this.dispatcher.dispatch(GroupMembersEvents.filterGroupMembers({ department: this.filters().department ?? '' }));
  }

  public clearFilters(): void {
    this.dispatcher.dispatch(GroupMembersEvents.clearFilters());
  }

  public paginateMembers(event: PageEvent): void {
    this.dispatcher.dispatch(GroupMembersEvents.paginateGroupMembers({ page: event.pageIndex + 1, limit: event.pageSize }));
  }

  public async deleteMember(row: GetGroupMember): Promise<void> {
    const result = await this.confirmationDialogService.confirm({
      title: 'Delete member',
      message: `Are you sure you want to delete <strong>${row.name}</strong>?`,
      positiveButtonText: 'Yes, delete',
      negativeButtonText: 'No, cancel',
    });

    if (result) {
      this.dispatcher.dispatch(GroupMembersEvents.deleteGroupMember({
        group_id: row.group_id,
        member: row,
      }));
    }
  }
}