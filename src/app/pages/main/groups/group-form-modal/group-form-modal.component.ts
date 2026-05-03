import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Events } from '@ngrx/signals/events';
import { map, pipe, tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import type { GetGroup } from '@/app/types/groups/groups.type';
import { GroupFormComponent } from '../group-form/group-form.component';
import { GroupsEvents } from '@/app/store/groups/groups.events';

@Component({
  selector: 'app-group-form-modal',
  imports: [MatDialogModule, MatButtonModule, GroupFormComponent],
  templateUrl: './group-form-modal.component.html',
  styleUrl: './group-form-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupFormModalComponent {
  private readonly dialogRef = inject(MatDialogRef<GroupFormModalComponent, GetGroup | undefined>);
  private readonly events = inject(Events);

  protected cancel(): void {
    this.dialogRef.close(undefined);
  }

  #closeOnCreateGroupSuccess = rxMethod<GetGroup>(
    pipe(
      tap((group) => {
        this.dialogRef.close(group);
      })
    )
  )(this.events.on(GroupsEvents.createGroupSuccess).pipe(map(({ payload }) => payload)));
}