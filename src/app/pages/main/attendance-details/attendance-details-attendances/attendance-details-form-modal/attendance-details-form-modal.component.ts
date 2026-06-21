import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, required, validate  } from '@angular/forms/signals';
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
import { AttendanceDetailsStore } from '@/app/store/attendance-details/attendance-details.store';

interface AttendanceFormData {
  record?: GetAttendance;
}

export interface AttendanceFormModel {
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
export class AttendanceFormModalComponent {
  private readonly dialogRef = inject(MatDialogRef<AttendanceFormModalComponent>);
  private readonly data = inject<AttendanceFormData>(MAT_DIALOG_DATA, { optional: true });
  private readonly dispatcher = inject(Dispatcher);
  private readonly events = inject(Events);
  private readonly attendanceStore = inject(AttendanceStore);
  private readonly attendanceDetailsStore = inject(AttendanceDetailsStore);

  public readonly isEditMode = !!this.data?.record;
  public readonly loadingForm = computed(() => this.attendanceStore.loadingForm());

  public readonly attendances_id = computed(() => this.attendanceDetailsStore.attendanceDetails()?.id ?? '');

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  private formatNameDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit', 
      year: 'numeric'
    }).replace(/\//g, '-');
  }

  public readonly formData = signal<AttendanceFormModel>({
    name: this.data?.record?.name ?? this.formatNameDate(new Date()),
    attendance_date: this.data?.record?.attendance_date ?? this.formatDate(new Date()),
    start_time: this.data?.record?.start_time ?? this.formatTime(new Date()),
    end_time: this.data?.record?.end_time ?? this.formatTime(new Date(Date.now() + 3600000)), 
  });

  public readonly recordForm = form(this.formData, (root) => {  
    required(root.name, { message: 'Name is required' });
    required(root.attendance_date, { message: 'Date is required' });
    validate(root.attendance_date, (ctx) => { 
        const date = ctx.value();
        if (!date) return undefined;
        const year = new Date(date).getFullYear();
        if (String(year).length > 4) {
        return { kind: 'invalidYear', message: 'Year must be 4 digits only' };
        }
        return undefined;
    });
    required(root.start_time, { message: 'Start time is required' });
    required(root.end_time, { message: 'End time is required' });
  }, {
    submission: {
      action: async () => {
        const m = this.formData();
        const attendance_id = this.attendanceStore.currentAttendanceId()!;
        const now = new Date().toISOString();

        if (this.isEditMode && this.data?.record) {
          this.dispatcher.dispatch(AttendanceEvents.updateAttendance({
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
          this.dispatcher.dispatch(AttendanceEvents.createAttendance({
            attendance_id,
            attendance: {
              id: crypto.randomUUID() as string,
              name: m.name.trim(),
              attendance_date: m.attendance_date.trim(),
              start_time: m.start_time.trim(),
              end_time: m.end_time.trim(),
              attendance_id,
              attendances_id: this.attendances_id(),
              status: 'active',
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
    if (m.end_time === m.start_time) return false;
    return true;
  });

  public readonly isFormDisabled = computed(() =>
    this.loadingForm() || !this.isEndTimeValid()
  );
  

  #closeOnCreateSuccess = rxMethod<GetAttendance>(
    pipe(tap(() => this.dialogRef.close()))
  )(this.events.on(AttendanceEvents.createAttendanceSuccess).pipe(
    map(({ payload }) => payload)
  ));

  #closeOnUpdateSuccess = rxMethod<GetAttendance>(
    pipe(tap(() => this.dialogRef.close()))
  )(this.events.on(AttendanceEvents.updateAttendanceSuccess).pipe(
    map(({ payload }) => payload)
  ));

  public closeDialog(): void {
    this.dialogRef.close();
  }
}