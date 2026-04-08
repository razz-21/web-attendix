import { TextTransformToReadablePipe } from '@pipes/text-transform-to-readable.pipe';
import { UserStatusSchema } from '@/app/types/users/users.schema';
import { Component, computed, effect, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmationDialogService } from '@/app/services/confirmation-dialog.service';
import { UsersStore } from '@/app/store/users/users.store';
import { Dispatcher } from '@ngrx/signals/events';
import { UsersEvents } from '@/app/store/users/users.events';
import { GetUser, UserStatus } from '@/app/types/users/users.type';

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.scss',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    TextTransformToReadablePipe,
  ],
})
export class UserTableComponent {
  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  private readonly usersStore = inject(UsersStore);
  private readonly dispatcher = inject(Dispatcher);

  protected readonly displayedColumns: string[] = [
    'rfid',
    'fullname',
    'email',
    'department',
    'role',
    'status',
    'actions',
  ];
  protected readonly loadingRowColumns: string[] = ['loading'];

  public readonly loading = computed(() => this.usersStore.loading());
  public readonly pagination = computed(() => this.usersStore.pagination());
  public readonly users = computed(() => this.usersStore.users());
  public readonly data = computed(() => [...this.users()]);

  public readonly userStatuses = UserStatusSchema.options;

  public fullName(row: GetUser): string {
    return `${row.firstname} ${row.lastname}`.trim();
  }

  public viewUser(row: GetUser): void {
    console.log(row);
  }

  public async deleteUser(row: GetUser): Promise<void> {
    const result = await this.confirmationDialogService.confirm({
      title: 'Delete user',
      message: `Are you sure you want to delete this user <strong>${this.fullName(row)}</strong>?`,
      positiveButtonText: 'Yes, delete',
      negativeButtonText: 'No, cancel',
    });

    if (result) {
      this.dispatcher.dispatch(UsersEvents.deleteUser({ user: row }));
    }
  }
}
