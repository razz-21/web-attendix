import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router'
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { GroupsStore } from '@/app/store/groups/groups.store';
import { GroupsEvents } from '@/app/store/groups/groups.events';
import { Dispatcher } from '@ngrx/signals/events';
import { GetGroup } from '@/app/types/groups/groups.type';
import { ConfirmationDialogService } from '@/app/services/confirmation-dialog.service';
import { AuthStore } from '@/app/store/auth/auth.store';

@Component({
  selector: 'app-group-table',
  templateUrl: './group-table.component.html',
  styleUrl: './group-table.component.scss',
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
    MatChipsModule,
    FormsModule,
  ],
})
export class GroupTableComponent {
  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  private readonly groupsStore = inject(GroupsStore);
  private readonly dispatcher = inject(Dispatcher);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);

 protected readonly displayedColumns: string[] = [
    'name',
    'description',
    'visibility',
    'createdBy',
    'actions',
  ];
  protected readonly loadingRowColumns: string[] = ['loading'];

  public readonly currentUser = computed(() => this.authStore.user());

  public getInitials(firstname?: string, lastname?: string): string {
    const firstInitial = firstname?.charAt(0) || '';
    const lastInitial = lastname?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase() || '?';
  }

  public readonly loading = computed(() => this.groupsStore.loading());
  public readonly pagination = computed(() => this.groupsStore.pagination());
  public readonly filters = computed(() => this.groupsStore.filters());
  public readonly groups = computed(() => this.groupsStore.groups());
  public readonly data = computed(() => [...this.groups()]);
  public readonly hasFilters = computed(() => this.groupsStore.hasFilters());

  public readonly pageSizeOptions = [10, 25, 50];

  /** Returns true if the current user is the creator of the group. */
  public canDeleteGroup(row: GetGroup): boolean {
    const user = this.currentUser();
    if (!user) return false;
    return row.created_by === user.id;
  }

  public viewGroup(row: GetGroup): void {
    this.router.navigate(['/main/groups', row.id, 'members']);
  }

  public searchGroups(): void {
    this.dispatcher.dispatch(GroupsEvents.searchGroups({ q: this.filters().q ?? '' }));
  }

  public clearFilters(): void {
    this.dispatcher.dispatch(GroupsEvents.clearFilters());
  }

  public paginateGroups(event: PageEvent): void {
    this.dispatcher.dispatch(GroupsEvents.paginateGroups({ page: event.pageIndex + 1, limit: event.pageSize }));
  }

  public async deleteGroup(row: GetGroup): Promise<void> {
    const result = await this.confirmationDialogService.confirm({
      title: 'Delete group',
      message: `Are you sure you want to delete group <strong>${row.name}</strong>?`,
      positiveButtonText: 'Yes, delete',
      negativeButtonText: 'No, cancel',
    });

    if (result) {
      this.dispatcher.dispatch(GroupsEvents.deleteGroup({ group: row }));
    }
  }
}