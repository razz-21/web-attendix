import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Dispatcher, Events } from '@ngrx/signals/events';
import { AttendanceEvents } from '@/app/store/attendance/attendance.events';
import { AttendanceStore } from '@/app/store/attendance/attendance.store';
import { GetAttendance } from '@/app/types/attendance/attendance.types';
import { map, pipe, tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

@Component({
  selector: 'app-edit-attendance-record-modal',
  templateUrl: './edit-attendance-form-modal.component.html',
  styleUrl: './edit-attendance-form-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormRoot,
    FormField,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
})
export class EditAttendanceModalComponent {
  private readonly dialogRef = inject(MatDialogRef<EditAttendanceModalComponent>);
  public readonly record = inject<GetAttendance>(MAT_DIALOG_DATA);
  private readonly dispatcher = inject(Dispatcher);
  private readonly attendanceRecordsStore = inject(AttendanceStore);
  private readonly events = inject(Events);
  public readonly maxYear = 9999;

  public readonly loadingForm = computed(() => this.attendanceRecordsStore.loadingForm());

  public readonly formData = signal({
    name: this.record.name,
    attendance_date: this.record.attendance_date,
    start_time: this.record.start_time,
    end_time: this.record.end_time,
  });

  public readonly recordForm = form(this.formData, (root) => {
    required(root.name, { message: 'Name is required' });
    required(root.attendance_date, { message: 'Date is required' });
    required(root.start_time, { message: 'Start time is required' });
    required(root.end_time, { message: 'End time is required' });
  }, {
    submission: {
      action: async () => {
        const m = this.formData();
        const attendance_id = this.attendanceRecordsStore.currentAttendanceId()!;
        const now = new Date().toISOString();

        this.dispatcher.dispatch(AttendanceEvents.updateAttendance({
          attendance_id,
          id: this.record.id,
          data: {
            name: m.name.trim(),
            attendance_date: m.attendance_date.trim(),
            start_time: m.start_time.trim(),
            end_time: m.end_time.trim(),
            updated_at: now,
          },
        }));
        return undefined;
      },
    },
  });

  public readonly isEndTimeValid = computed(() => {
    const m = this.formData();
    if (!m.start_time || !m.end_time) return true;
    if (m.end_time === m.start_time) return false;
    return true;
  });

  public readonly isFormDisabled = computed(() =>
    this.loadingForm() || !this.isEndTimeValid()
  );

  public onDateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value) {
        const parts = value.split('-');
        if (parts[0] && parts[0].length > 4) {
        parts[0] = parts[0].slice(0, 4);
        input.value = parts.join('-');
        this.formData.update(m => ({ ...m, attendance_date: input.value }));
        }
    }
  }

  #closeOnUpdateSuccess = rxMethod<GetAttendance>(
    pipe(tap(() => this.dialogRef.close()))
  )(this.events.on(AttendanceEvents.updateAttendanceSuccess).pipe(
    map(({ payload }) => payload)
  ));

  public closeDialog(): void {
    this.dialogRef.close();
  }
}