import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { FormField, FormRoot, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PostGroupSchema } from '@/app/types/groups/groups.schema';
import type { PostGroup } from '@/app/types/groups/groups.type';
import { Dispatcher } from '@ngrx/signals/events';
import { GroupsEvents } from '@/app/store/groups/groups.events';
import { GroupsStore } from '@/app/store/groups/groups.store';
import { AuthStore } from '@/app/store/auth/auth.store';

export interface GroupFormModel {
  name: string;
  description: string;
}

const emptyModel = (): GroupFormModel => ({
  name: '',
  description: '',
});

@Component({
  selector: 'app-group-form',
  templateUrl: './group-form.component.html',
  styleUrl: './group-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormRoot,
    FormField,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
})
export class GroupFormComponent {
  private readonly dispatcher = inject(Dispatcher);
  private readonly groupsStore = inject(GroupsStore);
  private readonly authStore = inject(AuthStore); 

  public readonly model = signal<GroupFormModel>(emptyModel());
  public readonly groupCancelled = output<void>();
  public readonly loadingForm = computed(() => this.groupsStore.loadingForm());

  public readonly groupForm = form(this.model, (root) => {
    required(root.name);
  }, {
    submission: {
      action: async () => {
        const m = this.model();
        const now = new Date().toISOString();
        const payload: PostGroup = {
          id: crypto.randomUUID() as string,
          name: m.name.trim(),
          description: m.description.trim() || undefined,
          workspace_id: crypto.randomUUID() as string,
          created_by: this.authStore.user()?.id ?? crypto.randomUUID(),
          created_at: now,
        };
        PostGroupSchema.parse(payload);
        this.dispatcher.dispatch(GroupsEvents.createGroup({ group: payload }));
        return undefined;
      },
    },
  });

  public cancel(): void {
    this.groupCancelled.emit();
  }
}