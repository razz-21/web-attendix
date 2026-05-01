import { WorkspaceDetailsEvents } from "@/app/store/workspace-details/workspace-details.events";
import { WorkspaceDetailsStore } from "@/app/store/workspace-details/workspace-details.store";
import { GetWorkspace } from "@/app/types/workspaces/workspaces.types";
import { isObjectsTheSame } from "@/app/utils/is-objects-the-same";
import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { FormField, FormRoot, form, required, validate } from "@angular/forms/signals";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { Dispatcher, Events } from "@ngrx/signals/events";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { map, pipe, tap } from "rxjs";

interface WorkspaceUpdateFormModel {
  name: string;
  description: string;
  avatar: string;
}

@Component({
  selector: 'app-update-workspace-details-dialog-form',
  templateUrl: './update-workspace-details-dialog-form.component.html',
  styleUrls: ['./update-workspace-details-dialog-form.component.scss'],
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    FormRoot,
    FormField,
  ],
})
export class UpdateWorkspaceDetailsDialogFormComponent implements OnInit {
  private readonly dispatcher = inject(Dispatcher);
  private readonly events = inject(Events);
  private readonly workspaceDetailsStore = inject(WorkspaceDetailsStore);
  private readonly dialogRef = inject(
    MatDialogRef<UpdateWorkspaceDetailsDialogFormComponent, GetWorkspace | undefined>,
  );

  public readonly workspace = computed(() => this.workspaceDetailsStore.workspace());
  public readonly loadingForm = computed(() => this.workspaceDetailsStore.updateLoading());

  private readonly emptyModel = (): WorkspaceUpdateFormModel => ({
    name: '',
    description: '',
    avatar: '',
  });

  public readonly workspaceModel = signal<WorkspaceUpdateFormModel>(this.emptyModel());

  public ngOnInit(): void {
    const workspace = this.workspace();

    if (!workspace) {
      return;
    }

    this.workspaceModel.set({
      name: workspace.name ?? '',
      description: workspace.description ?? '',
      avatar: workspace.avatar ?? '',
    });
  }

  public readonly workspaceForm = form(
    this.workspaceModel,
    (root) => {
      required(root.name);
      validate(root.name, ({ value }) =>
        value().trim().length > 0 ? undefined : { kind: 'required', message: 'Name is required' },
      );
    },
    {
      submission: {
        action: async () => {
          const workspace = this.workspace();
          if (!workspace) {
            return;
          }

          this.dispatcher.dispatch(
            WorkspaceDetailsEvents.updateWorkspace({
              id: workspace.id,
              workspace: {
                name: this.workspaceModel().name.trim(),
                description: this.workspaceModel().description.trim(),
                avatar: this.workspaceModel().avatar.trim(),
              },
            }),
          );
        },
      },
    },
  );

  public readonly isValueTheSameWithCurrentValue = computed(() => {
    const workspace = this.workspace();
    if (!workspace) {
      return false;
    }

    return isObjectsTheSame(
      {
        name: this.workspaceForm.name().value().trim(),
        description: this.workspaceForm.description().value().trim(),
        avatar: this.workspaceForm.avatar().value().trim(),
      },
      {
        name: workspace.name ?? '',
        description: workspace.description ?? '',
        avatar: workspace.avatar ?? '',
      },
    );
  });

  #onSuccessUpdateWorkspace = rxMethod<GetWorkspace>(
    pipe(
      tap(() => {
        this.dialogRef.close(undefined);
      }),
    ),
  )(this.events.on(WorkspaceDetailsEvents.updateWorkspaceSuccess).pipe(map(({ payload }) => payload.workspace)));

  public cancel(): void {
    this.dialogRef.close(undefined);
  }
}