import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { AttendeeFormComponent } from '../attendee-form/attendee-form.component';
import type { GetAttendee } from '@/app/types/attendaces/attendees.types';

@Component({
  selector: 'app-attendee-form-modal',
  templateUrl: './attendee-form-modal.component.html',
  styleUrl: './attendee-form-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, AttendeeFormComponent],
})
export class AttendeeFormModalComponent {
  public readonly dialogRef = inject(MatDialogRef<AttendeeFormModalComponent, GetAttendee | undefined>);
  public readonly data = inject<any>(MAT_DIALOG_DATA);

  protected cancel(): void {
    this.dialogRef.close(undefined);
  }
}
