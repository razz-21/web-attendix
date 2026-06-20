import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { Dispatcher } from '@ngrx/signals/events';
import { AttendanceDetailsEvents } from '@/app/store/attendance-details/attendance-details.events'; 
import { AttendanceDetailsStore } from '@/app/store/attendance-details/attendance-details.store';
import { AttendanceConfigurations } from '@/app/types/attendaces/attendances.types';
import { AuthStore } from '@/app/store/auth/auth.store';

@Component({
  selector: 'app-attendance-details-configurations',
  templateUrl: './attendance-details-configurations.component.html',
  styleUrls: ['./attendance-details-configurations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, FormsModule ],
})

export class AttendanceDetailsConfigurationsComponent {

   private readonly dispatcher = inject(Dispatcher);
  private readonly attendanceDetailsStore = inject(AttendanceDetailsStore);
  private readonly authStore = inject(AuthStore);

  public readonly attendance = computed(() =>
    this.attendanceDetailsStore.attendanceDetails()
  );

  public readonly isAdmin = computed(() =>
    this.authStore.user()?.role === 'admin'
  );

  public attendanceLoading = false;
  public pointLoading = false;

  public readonly formData = signal({
    late_threshold: this.attendance()?.late_threshold ?? 0,
    present_point: this.attendance()?.configurations?.present_point ?? 1,
    late_point: this.attendance()?.configurations?.late_point ?? 0.5,
    absent_point: this.attendance()?.configurations?.absent_point ?? 0,
    excused_point: this.attendance()?.configurations?.excused_point ?? 0.75,
  });

  public saveAttendanceSettings(): void {

    const id = this.attendance()?.id;

    if (!id) return;

    this.attendanceLoading = true;

    this.dispatcher.dispatch(
      AttendanceDetailsEvents.updateAttendanceDetails({
        id,
        payload: {
          late_threshold: this.formData().late_threshold,
        },
      })
    );

    this.attendanceLoading = false;
  }

  public savePointSystem(): void {

    const id = this.attendance()?.id;

    if (!id) return;

    this.pointLoading = true;

    this.dispatcher.dispatch(
      AttendanceDetailsEvents.updateAttendanceDetails({
        id,
        payload: {
          configurations: {
            present_point: this.formData().present_point,
            late_point: this.formData().late_point,
            absent_point: this.formData().absent_point,
            excused_point: this.formData().excused_point,
          } as AttendanceConfigurations,
        },
      })
    );

    this.pointLoading = false;
  }
}