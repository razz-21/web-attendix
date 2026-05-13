import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { GetGroup } from '@/app/types/groups/groups.type';
import { GroupsService } from '@/app/services/groups.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-import-attendees-form',
  templateUrl: './import-attendees-form.component.html',
  styleUrl: './import-attendees-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ]
})
export class ImportAttendeesFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly groupsService = inject(GroupsService);

  @Input() public disabled = false;
  @Output() public readonly importSubmitted = new EventEmitter<{ group_id: string }>();
  @Output() public readonly formCancelled = new EventEmitter<void>();

  public readonly groups = signal<GetGroup[]>([]);
  public readonly isLoadingGroups = signal<boolean>(true);

  public readonly form = this.fb.group({
    group_id: ['', [Validators.required]],
  });

  public async ngOnInit(): Promise<void> {
    try {
      this.isLoadingGroups.set(true);
      const response = await this.groupsService.getPaginatedGroups(1, 1000);
      this.groups.set(response.data || []);
    } catch (error) {
      console.error('Failed to load groups', error);
    } finally {
      this.isLoadingGroups.set(false);
    }
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.importSubmitted.emit({
      group_id: this.form.value.group_id as string,
    });
  }

  public onCancel(): void {
    this.formCancelled.emit();
  }
}
