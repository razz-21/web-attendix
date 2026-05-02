import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Events } from '@ngrx/signals/events';
import { map, pipe, tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import type { GetGroupMember } from '@/app/types/group-members/group-members.type';
import { GroupMemberFormComponent } from '../group-member-form/group-member-form.component';
import { GroupMembersEvents } from '@/app/store/group-members/group-members.events';

@Component({
  selector: 'app-group-member-form-modal',
  imports: [MatDialogModule, MatButtonModule, GroupMemberFormComponent],
  templateUrl: './group-member-form-modal.component.html',
  styleUrl: './group-member-form-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupMemberFormModalComponent {
  private readonly dialogRef = inject(MatDialogRef<GroupMemberFormModalComponent, GetGroupMember | undefined>);
  private readonly events = inject(Events);

  protected cancel(): void {
    this.dialogRef.close(undefined);
  }

  #closeOnSuccess = rxMethod<GetGroupMember>(
    pipe(
      tap((member) => {
        this.dialogRef.close(member);
      })
    )
  )(this.events.on(GroupMembersEvents.createGroupMemberSuccess).pipe(map(({ payload }) => payload)));
}