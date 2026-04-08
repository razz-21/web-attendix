import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Events } from '@ngrx/signals/events';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { map, pipe, tap } from 'rxjs';
import type { GetUser } from '@/app/types/users/users.type';
import { UserFormComponent } from '../user-form/user-form.component';
import { UsersEvents } from '@/app/store/users/users.events';

@Component({
  selector: 'app-user-form-modal',
  imports: [MatDialogModule, MatButtonModule, UserFormComponent],
  templateUrl: './user-form-modal.component.html',
  styleUrl: './user-form-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormModalComponent {
  private readonly dialogRef = inject(MatDialogRef<UserFormModalComponent, GetUser | undefined>);
  private readonly events = inject(Events);

  protected cancel(): void {
    this.dialogRef.close(undefined);
  }

  #closeOnCreateUserSuccess = rxMethod<GetUser>(
    pipe(
      tap((user) => {
        this.dialogRef.close(user);
      })
    )
  )(this.events.on(UsersEvents.createUserSuccess).pipe(map(({ payload }) => payload)));
}
