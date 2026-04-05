import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import type { PostUser } from '@/app/types/users/users.type';
import { UserFormModalComponent } from './user-form-modal/user-form-modal.component';
import { UserTableComponent } from './user-table/user-table.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  imports: [MatButtonModule, UserTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {
  private readonly dialog = inject(MatDialog);

  public openAddUser(): void {
    this.dialog
      .open<UserFormModalComponent, undefined, PostUser | undefined>(UserFormModalComponent, {
        maxWidth: '620px',
        width: '100%',
        height: 'auto',
        autoFocus: 'first-tabbable',
      })
  }
}