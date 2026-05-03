import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AttendanceFormComponent, AttendanceFormModel } from '../attendance-form/attendance-form.component';

@Component({
  selector: 'app-attendance-form-modal',
  templateUrl: './attendance-form-modal.component.html',
  styleUrl: './attendance-form-modal.component.scss',
  imports: [MatDialogModule, AttendanceFormComponent],
})
export class AttendanceFormModalComponent {
  private readonly dialogRef = inject(MatDialogRef<AttendanceFormModalComponent>);

  public onFormSubmitted(data: AttendanceFormModel): void {
    this.dialogRef.close(data);
  }

  public onFormCancelled(): void {
    this.dialogRef.close();
  }
}
