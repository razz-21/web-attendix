import { UserDetailsEvents } from '@/app/store/user-details/user-details.events';
import { UserDetailsStore } from '@/app/store/user-details/user-details.store';
import { GetUser } from '@/app/types/users/users.type';
import { GetWorkspace } from '@/app/types/workspaces/workspaces.types';
import { WorkspacesService } from '@/app/services/workspaces.service';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormField, FormRoot, form } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Dispatcher, Events } from '@ngrx/signals/events';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { map, pipe, tap } from 'rxjs';

export interface UserDetailsWorkspaceModel {
  workspace_id: string;
}

export interface UserDetailsWorkspaceFormResult {
  workspace_id: string;
}

const emptyModel = (): UserDetailsWorkspaceModel => ({
  workspace_id: '',
});

@Component({
  selector: 'app-user-details-workspace-form',
  templateUrl: './user-details-workspace-form.component.html',
  styleUrl: './user-details-workspace-form.component.scss',
  imports: [
    FormRoot,
    FormField,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsWorkspaceFormComponent implements OnInit {
  private readonly userDetailsStore = inject(UserDetailsStore);
  private readonly dispatcher = inject(Dispatcher);
  private readonly events = inject(Events);
  private readonly dialogRef = inject(MatDialogRef<UserDetailsWorkspaceFormComponent, UserDetailsWorkspaceFormResult | undefined>);
  private readonly workspacesService = inject(WorkspacesService);

  public readonly currentUser = computed(() => this.userDetailsStore.user());
  public readonly updateLoading = computed(() => this.userDetailsStore.updateLoading());

  public readonly workspaces = signal<GetWorkspace[]>([]);
  public readonly workspacesLoading = signal(false);

  public readonly model = signal<UserDetailsWorkspaceModel>({
    ...emptyModel(),
  });

  public readonly userDetailsWorkspaceForm = form(this.model, (_root) => {
    // No required validation — "No workspace" (empty) is a valid choice
  }, {
    submission: {
      action: async () => {
        const workspaceId = this.model().workspace_id;
        this.dispatcher.dispatch(UserDetailsEvents.updateUserDetails({
          // Send null to the API when the user clears the workspace
          payload: { workspace_id: workspaceId.trim().length > 0 ? workspaceId : null },
        }));
        return undefined;
      },
    },
  });

  public readonly isValueIsTheSameWithCurrentValue = computed(() => {
    const currentUser = this.currentUser();
    if (!currentUser) {
      return false;
    }
    return this.userDetailsWorkspaceForm.workspace_id().value() === (currentUser.workspace_id ?? '');
  });

  #onSuccessUpdateWorkspace = rxMethod<GetUser>(
    pipe(
      tap(() => {
        this.dialogRef.close(undefined);
      })
    )
  )(this.events.on(UserDetailsEvents.updateUserDetailsSuccess).pipe(map(({ payload }) => payload.user)));

  public async ngOnInit(): Promise<void> {
    const currentUser = this.currentUser();
    if (currentUser) {
      this.model.set({
        workspace_id: currentUser.workspace_id ?? '',
      });
    }

    this.workspacesLoading.set(true);
    try {
      const result = await this.workspacesService.getWorkspaces({ page: 1, limit: 100 });
      this.workspaces.set(result.data);
    } finally {
      this.workspacesLoading.set(false);
    }
  }

  public cancel(): void {
    this.dialogRef.close(undefined);
  }
}
