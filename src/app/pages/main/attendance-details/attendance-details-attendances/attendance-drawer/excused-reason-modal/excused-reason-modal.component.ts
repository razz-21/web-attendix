import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { Dispatcher } from '@ngrx/signals/events';
import { AttendanceRecordEvents } from '@/app/store/attendance-record/attendance-record.events';
import { AttendanceRecordReasonType, GetAttendanceRecord } from '@/app/types/attendance-record/attendance-record.types';
import { AttendanceRecordStore } from '@/app/store/attendance-record/attendance-record.store';

interface ExcusedReasonModalData {
  attendances_id: string;
  record: GetAttendanceRecord;
}

@Component({
  selector: 'app-excused-reason-modal',
  templateUrl: './excused-reason-modal.component.html',
  styleUrl: './excused-reason-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    FormsModule,
  ],
})
export class ExcusedReasonModalComponent {
  private readonly dialogRef = inject(MatDialogRef<ExcusedReasonModalComponent>);
  private readonly data = inject<ExcusedReasonModalData>(MAT_DIALOG_DATA);
  private readonly dispatcher = inject(Dispatcher);
  private readonly attendanceRecordStore = inject(AttendanceRecordStore);

  public readonly loadingForm = computed(() => this.attendanceRecordStore.loading());

  public readonly reasonTypes: { value: AttendanceRecordReasonType; label: string }[] = [
    { value: 'sick', label: 'Sick' },
    { value: 'personal', label: 'Personal' },
    { value: 'excused', label: 'Excused' },
    { value: 'other', label: 'Other' },
  ];

  public readonly formData = signal({
    reason_type: this.data.record.reason_type as AttendanceRecordReasonType | null,
    reason: this.data.record.reason ?? '',
  });

  public readonly isFormValid = computed(() => {
    const m = this.formData();
    return !!m.reason_type && !!m.reason.trim();
  });

  public save(): void {
    if (!this.isFormValid()) return;
    const m = this.formData();
    this.dispatcher.dispatch(AttendanceRecordEvents.updateAttendanceRecord({
      attendances_id: this.data.attendances_id,
      id: this.data.record.id,
      payload: {
        reason_type: m.reason_type,
        reason: m.reason.trim(),
      },
    }));
    this.dialogRef.close();
  }

  public closeDialog(): void {
    this.dialogRef.close();
  }
}