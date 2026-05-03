import { WorkspacesEvents } from "@/app/store/workspaces/workspaces.events";
import { WorkspacesStore } from "@/app/store/workspaces/workspaces.store";
import { PostWorkspace, Workspace } from "@/app/types/workspaces/workspaces.types";
import { Component, computed, inject, signal } from "@angular/core";
import { FormRoot, FormField, form, required } from "@angular/forms/signals";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { Dispatcher, Events } from "@ngrx/signals/events";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { map, pipe, tap } from "rxjs";

interface WorkspaceFormModel {
  name: string;
  description: string;
  avatar: string;
}

@Component({
  selector: 'app-workspace-form-dialog',
  templateUrl: './workspace-form-dialog.component.html',
  styleUrls: ['./workspace-form-dialog.component.scss'],
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    FormRoot,
    FormField,
  ]
})
export class WorkspaceFormDialogComponent {
  private readonly dispatcher = inject(Dispatcher);
  private readonly events = inject(Events);
  private readonly workspacesStore = inject(WorkspacesStore);
  private readonly dialogRef = inject(MatDialogRef<WorkspaceFormDialogComponent, Workspace | undefined>);

  private readonly emptyModel = (): WorkspaceFormModel => ({
    name: '',
    description: '',
    avatar: '',
  });

  public readonly workspaceModel = signal<WorkspaceFormModel>(this.emptyModel());

  public readonly workspaceForm = form(this.workspaceModel, (root) => {
    required(root.name);
  }, {
    submission: {
      action: async () => {
        const formModel = this.workspaceModel();
        const payload: PostWorkspace = {
          id: crypto.randomUUID(),
          name: formModel.name,
          description: formModel.description,
          avatar: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        this.dispatcher.dispatch(WorkspacesEvents.createWorkspace({ workspace: payload }));
      },
    },
  });

  public loadingForm = computed(() => this.workspacesStore.loadingForm());

  #checkWorkspaceCreated = rxMethod<Workspace>(
    pipe(
      tap(() => {
        this.dialogRef.close(undefined);
      })
    )
  )(this.events.on(WorkspacesEvents.createWorkspaceSuccess).pipe(map(({ payload }) => payload)));

  public cancel(): void {
    this.dialogRef.close(undefined);
  }
}