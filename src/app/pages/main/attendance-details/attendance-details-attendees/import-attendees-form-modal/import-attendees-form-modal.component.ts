import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ImportAttendeesFormComponent } from '../import-attendees-form/import-attendees-form.component';
import { Dispatcher } from '@ngrx/signals/events';
import { AttendanceAttendeeEvents } from '@/app/store/attendance-attendee/attendance-attendee.events';
import { AttendanceAttendeeStore } from '@/app/store/attendance-attendee/attendance-attendee.store';

@Component({
  selector: 'app-import-attendees-form-modal',
  templateUrl: './import-attendees-form-modal.component.html',
  styleUrl: './import-attendees-form-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, ImportAttendeesFormComponent],
})
export class ImportAttendeesFormModalComponent {
  public readonly dialogRef = inject(MatDialogRef<ImportAttendeesFormModalComponent>);
  public readonly data = inject<{ attendanceId: string }>(MAT_DIALOG_DATA);
  private readonly dispatcher = inject(Dispatcher);
  public readonly store = inject(AttendanceAttendeeStore);

  public onSubmit(event: { group_id: string }): void {
    this.dispatcher.dispatch(AttendanceAttendeeEvents.importAttendees({
      attendance_id: this.data.attendanceId,
      group_id: event.group_id
    }));
    // We will close the modal via events in the parent component upon success
  }

  protected cancel(): void {
    this.dialogRef.close();
  }
}
