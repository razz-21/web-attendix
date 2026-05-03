import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { FormField, FormRoot, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DEPARTMENTS } from '@/app/constants/departments.constant';
import { Dispatcher } from '@ngrx/signals/events';
import { GroupMembersEvents } from '@/app/store/group-members/group-members.events';
import { GroupMembersStore } from '@/app/store/group-members/group-members.store';

export interface GroupMemberFormModel {
  rfid: string;
  name: string;
  department: string;
  section: string;
  year_level: string;
}

const emptyModel = (): GroupMemberFormModel => ({
  rfid: '',
  name: '',
  department: '',
  section: '',
  year_level: '',
});

@Component({
  selector: 'app-group-member-form',
  templateUrl: './group-member-form.component.html',
  styleUrl: './group-member-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormRoot,
    FormField,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export class GroupMemberFormComponent {
  private readonly dispatcher = inject(Dispatcher);
  private readonly groupMembersStore = inject(GroupMembersStore);

  public readonly model = signal<GroupMemberFormModel>(emptyModel());
  public readonly memberCancelled = output<void>();

  public readonly departments = DEPARTMENTS;
  public readonly yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  public readonly loadingForm = computed(() => this.groupMembersStore.loadingForm());

  public readonly groupForm = form(this.model, (root) => {
    required(root.rfid);
    required(root.name);
  }, {
    submission: {
      action: async () => {
        const m = this.model();
        const group_id = this.groupMembersStore.currentGroupId()!;
        this.dispatcher.dispatch(GroupMembersEvents.createGroupMember({
          group_id,
          member: {
            rfid: m.rfid.trim(),
            name: m.name.trim(),
            department: m.department.trim() || undefined,
            section: m.section.trim() || undefined,
            year_level: m.year_level.trim() || undefined,
            group_type: 'student',
            group_id,
          },
        }));
        return undefined;
      },
    },
  });

  public cancel(): void {
    this.memberCancelled.emit();
  }
}