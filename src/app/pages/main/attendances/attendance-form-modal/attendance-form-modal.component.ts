import { Component, computed, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Dispatcher, Events } from '@ngrx/signals/events';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { map, pipe, tap } from 'rxjs';
import { AttendanceFormComponent, AttendanceFormModel } from '../attendance-form/attendance-form.component';
import { SCHEDULE_DAY_MAP } from '@/app/constants/schedule-days.constant';
import { AttendancesEvents } from '@/app/store/attendances/attendances.events';
import { AttendancesStore } from '@/app/store/attendances/attendances.store';
import { AuthStore } from '@/app/store/auth/auth.store';
import {
  AttendanceScheduleDays,
  GetAttendance,
  PatchAttendance,
  PostAttendance,
} from '@/app/types/attendaces/attendances.types';

export interface AttendanceFormModalData {
  initialData?: AttendanceFormModel;
  attendanceId?: string;
}

@Component({
  selector: 'app-attendance-form-modal',
  templateUrl: './attendance-form-modal.component.html',
  styleUrl: './attendance-form-modal.component.scss',
  imports: [MatDialogModule, AttendanceFormComponent],
})
export class AttendanceFormModalComponent {
  private readonly dialogRef = inject(MatDialogRef<AttendanceFormModalComponent>);
  private readonly dispatcher = inject(Dispatcher);
  private readonly events = inject(Events);
  private readonly attendancesStore = inject(AttendancesStore);
  private readonly authStore = inject(AuthStore);

  public readonly dialogData = inject<AttendanceFormModalData>(MAT_DIALOG_DATA, { optional: true });

  public readonly isSubmitting = computed(
    () => this.attendancesStore.createLoading() || this.attendancesStore.updateLoading()
  );

  public onFormSubmitted(data: AttendanceFormModel): void {
    if (this.dialogData?.attendanceId) {
      this.dispatchUpdate(this.dialogData.attendanceId, data);
      return;
    }

    if (this.dialogData?.initialData) {
      this.dialogRef.close(data);
      return;
    }

    this.dispatchCreate(data);
  }

  public onFormCancelled(): void {
    this.dialogRef.close();
  }

  private dispatchCreate(formData: AttendanceFormModel): void {
    const userId = this.authStore.user()?.id;
    if (!userId) {
      console.error('User ID not available');
      return;
    }

    const backendPayload: PostAttendance = {
      id: crypto.randomUUID(),
      name: formData.name,
      code: formData.code,
      status: 'active',
      schedule_days: formData.scheduleDays.map(
        (day) => SCHEDULE_DAY_MAP[day] as AttendanceScheduleDays[number]
      ),
      description: formData.description,
      late_threshold: formData.lateThreshold,
      configurations: {
        present_point: 1,
        late_point: 0.5,
        absent_point: 0,
        excused_point: 0.75,
      },
      shared_with: [],
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.dispatcher.dispatch(AttendancesEvents.createAttendance(backendPayload));
  }

  private dispatchUpdate(attendanceId: string, formData: AttendanceFormModel): void {
    const updateData: Partial<PatchAttendance> = {
      name: formData.name,
      code: formData.code,
      schedule_days: formData.scheduleDays.map(
        (day) => SCHEDULE_DAY_MAP[day] as AttendanceScheduleDays[number]
      ),
      description: formData.description,
      late_threshold: formData.lateThreshold,
      updated_at: new Date().toISOString(),
    };

    this.dispatcher.dispatch(AttendancesEvents.updateAttendance({ id: attendanceId, data: updateData }));
  }

  #closeOnCreateSuccess = rxMethod<GetAttendance>(
    pipe(tap(() => this.dialogRef.close()))
  )(this.events.on(AttendancesEvents.createAttendanceSuccess).pipe(map(({ payload }) => payload)));

  #closeOnUpdateSuccess = rxMethod<GetAttendance>(
    pipe(tap(() => this.dialogRef.close()))
  )(this.events.on(AttendancesEvents.updateAttendanceSuccess).pipe(map(({ payload }) => payload)));
}
