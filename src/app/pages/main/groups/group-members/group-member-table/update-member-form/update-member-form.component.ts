import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { FormField, FormRoot, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DEPARTMENTS } from '@/app/constants/departments.constant';
import type { GetGroupMember, PatchGroupMember } from '@/app/types/group-members/group-members.type';
import { Dispatcher } from '@ngrx/signals/events';
import { GroupMembersEvents } from '@/app/store/group-members/group-members.events';
import { GroupMembersStore } from '@/app/store/group-members/group-members.store';

export interface UpdateMemberFormModel {
  rfid: string;
  name: string;
  department: string;
  section: string;
  year_level: string;
}

@Component({
  selector: 'app-update-member-form',
  templateUrl: './update-member-form.component.html',
  styleUrl: './update-member-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormRoot,
    FormField,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
})
export class UpdateMemberFormComponent implements OnInit {
  private readonly dispatcher = inject(Dispatcher);
  private readonly groupMembersStore = inject(GroupMembersStore);

  public readonly member = input.required<GetGroupMember>();
  public readonly memberCancelled = output<void>();
  public readonly loadingForm = computed(() => this.groupMembersStore.updateMemberLoading());

  public readonly departments = DEPARTMENTS;
  public readonly yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  public readonly model = signal<UpdateMemberFormModel>({
    rfid: '',
    name: '',
    department: '',
    section: '',
    year_level: '',
  });

  public ngOnInit(): void {
    const m = this.member();
    this.model.set({
      rfid: m.rfid ?? '',
      name: m.name,
      department: m.department ?? '',
      section: m.section ?? '',
      year_level: m.year_level ?? '',
    });
  }

  public readonly memberForm = form(this.model, (root) => {
    required(root.name);
    required(root.department);
  }, {
    submission: {
      action: async () => {
        const m = this.model();
        const payload: PatchGroupMember = {
          rfid: m.rfid.trim() || undefined,
          name: m.name.trim(),
          department: m.department.trim(),
          section: m.section.trim() || undefined,
          year_level: m.year_level.trim() || undefined,
        };
        this.dispatcher.dispatch(GroupMembersEvents.updateGroupMember({
          group_id: this.member().group_id,
          member_id: this.member().id,
          payload,
        }));
        return undefined;
      },
    },
  });

  public cancel(): void {
    this.memberCancelled.emit();
  }
}