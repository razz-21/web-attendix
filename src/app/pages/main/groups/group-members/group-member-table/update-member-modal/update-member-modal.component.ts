import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GetGroupMember } from '@/app/types/group-members/group-members.type';
import { UpdateMemberFormComponent } from '../update-member-form/update-member-form.component';
import { Events } from '@ngrx/signals/events';
import { Dispatcher } from '@ngrx/signals/events';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, map } from 'rxjs';
import { GroupMembersEvents } from '@/app/store/group-members/group-members.events';

@Component({
  selector: 'app-update-member-modal',
  imports: [MatDialogModule, MatButtonModule, UpdateMemberFormComponent],
  templateUrl: './update-member-modal.component.html',
  styleUrl: './update-member-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateMemberModalComponent {
  private readonly dialogRef = inject(MatDialogRef<UpdateMemberModalComponent>);
  private readonly events = inject(Events);
  private readonly dispatcher = inject(Dispatcher);
  public readonly member = inject<GetGroupMember>(MAT_DIALOG_DATA);

  protected cancel(): void {
    this.dialogRef.close();
  }

  #closeOnUpdateSuccess = rxMethod<void>(
    pipe(
      tap(() => {
        this.dialogRef.close();
        this.dispatcher.dispatch(
          GroupMembersEvents.loadGroupMembers({ group_id: this.member.group_id })
        );
      })
    )
  )(this.events.on(GroupMembersEvents.updateGroupMemberSuccess).pipe(map(() => undefined)));
}