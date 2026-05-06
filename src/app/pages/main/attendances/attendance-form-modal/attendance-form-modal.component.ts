import { Component, computed, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AttendanceFormComponent, AttendanceFormModel } from '../attendance-form/attendance-form.component';

@Component({
  selector: 'app-attendance-form-modal',
  templateUrl: './attendance-form-modal.component.html',
  styleUrl: './attendance-form-modal.component.scss',
  imports: [MatDialogModule, AttendanceFormComponent],
})
export class AttendanceFormModalComponent {
  private readonly dialogRef = inject(MatDialogRef<AttendanceFormModalComponent>);
  public readonly data = inject<AttendanceFormModel | undefined>(MAT_DIALOG_DATA);

  public readonly title = computed(() => this.data ? 'Edit attendance configuration' : 'Add attendance configuration');
  public readonly description = computed(() => this.data ? 'Update the existing attendance configuration. Modify the fields below to update the system.' : 'Create a new attendance configuration. Fill the form below to add it to the system.');

  public onFormSubmitted(data: AttendanceFormModel): void {
    this.dialogRef.close(data);
  }

  public onFormCancelled(): void {
    this.dialogRef.close();
  }
}
