import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Dispatcher, Events } from '@ngrx/signals/events'; 
import { GroupsEvents } from '@/app/store/groups/groups.events';
import { GroupsStore } from '@/app/store/groups/groups.store';
import { GetGroup } from '@/app/types/groups/groups.type';
import { map, pipe, tap } from 'rxjs'; 
import { rxMethod } from '@ngrx/signals/rxjs-interop'; 

@Component({
  selector: 'app-group-edit-modal',
  templateUrl: './group-edit-modal.component.html',
  styleUrl: './group-edit-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormRoot,
    FormField,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
})
export class GroupEditModalComponent {
  private readonly dialogRef = inject(MatDialogRef<GroupEditModalComponent>);
  private readonly data = inject<{ group: GetGroup }>(MAT_DIALOG_DATA);
  private readonly dispatcher = inject(Dispatcher);
  private readonly groupsStore = inject(GroupsStore);
  private readonly events = inject(Events); 

  public readonly loadingForm = computed(() => this.groupsStore.loadingForm());

  public readonly groupFormData = signal({
    name: this.data.group.name ?? '',
    description: this.data.group.description ?? '',
  });

  public readonly groupForm = form(this.groupFormData, (root) => {
    required(root.name, { message: 'Group name is required' });
  });

  #closeOnUpdateGroupSuccess = rxMethod<GetGroup>(
    pipe(
        tap((group) => {
        this.dialogRef.close(group);
        })
    )
  )(this.events.on(GroupsEvents.updateGroupSuccess).pipe(map(({ payload }) => payload)));

  public closeDialog(): void {
    this.dialogRef.close();
  }

  public submitForm(): void {
    const m = this.groupFormData();
    this.dispatcher.dispatch(GroupsEvents.updateGroup({
      id: this.data.group.id,
      group: {
        name: m.name.trim(),
        description: m.description.trim() || undefined,
      },
    }));
  }
}