import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Dispatcher, Events } from '@ngrx/signals/events';
import { AttendanceRecordsEvents } from '@/app/store/attendance-records/attendance-records.events';
import { AttendanceRecordsStore } from '@/app/store/attendance-records/attendance-records.store';
import { GetAttendanceRecord } from '@/app/types/attendance-records/attendance-records.types';
import { map, pipe, tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

interface AttendanceRecordFormData {
  record?: GetAttendanceRecord;
}

export interface AttendanceRecordFormModel {
  name: string;
  attendance_date: string;
  start_time: string;
  end_time: string;
}

@Component({
  selector: 'app-attendance-details-form-modal',
  templateUrl: './attendance-details-form-modal.component.html',
  styleUrl: './attendance-details-form-modal.component.scss',
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
export class AttendanceRecordFormModalComponent {
  private readonly dialogRef = inject(MatDialogRef<AttendanceRecordFormModalComponent>);
  private readonly data = inject<AttendanceRecordFormData>(MAT_DIALOG_DATA, { optional: true });
  private readonly dispatcher = inject(Dispatcher);
  private readonly attendanceRecordsStore = inject(AttendanceRecordsStore);
  private readonly events = inject(Events);
  private readonly route = inject(ActivatedRoute);

  public readonly isEditMode = !!this.data?.record;
  public readonly loadingForm = computed(() => this.attendanceRecordsStore.loadingForm());

  public readonly formData = signal<AttendanceRecordFormModel>({
    name: this.data?.record?.name ?? '',
    attendance_date: this.data?.record?.attendance_date ?? '',
    start_time: this.data?.record?.start_time ?? '',
    end_time: this.data?.record?.end_time ?? '',
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

        if (this.isEditMode && this.data?.record) {
          this.dispatcher.dispatch(AttendanceRecordsEvents.updateAttendanceRecord({
            attendance_id,
            id: this.data.record.id,
            data: {
              name: m.name.trim(),
              attendance_date: m.attendance_date.trim(),
              start_time: m.start_time.trim(),
              end_time: m.end_time.trim(),
              updated_at: now,
            },
          }));
        } else {
          this.dispatcher.dispatch(AttendanceRecordsEvents.createAttendanceRecord({
            attendance_id,
            record: {
              id: crypto.randomUUID() as string,
              name: m.name.trim(),
              attendance_date: m.attendance_date.trim(),
              start_time: m.start_time.trim(),
              end_time: m.end_time.trim(),
              attendance_id,
              created_at: now,
              updated_at: now,
            },
          }));
        }
        return undefined;
      },
    },
  });

  public readonly isEndTimeValid = computed(() => {
   const m = this.formData();
   if (!m.start_time || !m.end_time) return true;
   return m.end_time > m.start_time;
  });

  public readonly isFormDisabled = computed(() =>
   this.loadingForm() || !this.isEndTimeValid()
  );

  #closeOnCreateSuccess = rxMethod<GetAttendanceRecord>(
    pipe(tap(() => this.dialogRef.close()))
  )(this.events.on(AttendanceRecordsEvents.createAttendanceRecordSuccess).pipe(
    map(({ payload }) => payload)
  ));

  #closeOnUpdateSuccess = rxMethod<GetAttendanceRecord>(
    pipe(tap(() => this.dialogRef.close()))
  )(this.events.on(AttendanceRecordsEvents.updateAttendanceRecordSuccess).pipe(
    map(({ payload }) => payload)
  ));

  public closeDialog(): void {
    this.dialogRef.close();
  }
}