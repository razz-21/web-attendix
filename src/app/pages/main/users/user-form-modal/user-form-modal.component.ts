import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import type { PostUser } from '@/app/types/users/users.type';
import { UserFormComponent } from '../user-form/user-form.component';

@Component({
  selector: 'app-user-form-modal',
  imports: [MatDialogModule, MatButtonModule, UserFormComponent],
  templateUrl: './user-form-modal.component.html',
  styleUrl: './user-form-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormModalComponent {
  
  private readonly dialogRef = inject(MatDialogRef<UserFormModalComponent, PostUser | undefined>);

  protected onUserCreated(user: PostUser): void {
    this.dialogRef.close(user);
  }

  protected cancel(): void {
    this.dialogRef.close(undefined);
  }
}
