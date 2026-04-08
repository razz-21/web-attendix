import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import type { GetUser } from '@/app/types/users/users.type';
import { UserFormModalComponent } from './user-form-modal/user-form-modal.component';
import { UserTableComponent } from './user-table/user-table.component';
import { UsersEvents } from '@/app/store/users/users.events';
import { Dispatcher } from '@ngrx/signals/events';
import { UsersStore } from '@/app/store/users/users.store';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  imports: [MatButtonModule, UserTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly dispatcher = inject(Dispatcher);
  private readonly usersStore = inject(UsersStore);

  public ngOnInit(): void {
    this.dispatcher.dispatch(UsersEvents.loadUsers());
  }

  public openAddUser(): void {
    this.dialog
      .open<UserFormModalComponent, undefined, GetUser | undefined>(UserFormModalComponent, {
        maxWidth: '620px',
        width: '100%',
        height: 'auto',
        autoFocus: 'first-tabbable',
      })
  }
}