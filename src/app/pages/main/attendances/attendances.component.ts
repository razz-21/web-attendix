import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { AttendanceTableComponent } from './attendance-table/attendance-table.component';
import { AttendanceFormModalComponent } from './attendance-form-modal/attendance-form-modal.component';
import { AttendanceFormModel } from './attendance-form/attendance-form.component';
import { Dispatcher } from '@ngrx/signals/events';
import { AttendancesStore } from '@/app/store/attendances/attendances.store';
import { AttendancesEvents } from '@/app/store/attendances/attendances.events';
import { AuthService } from '@/app/services/auth.service';
import { ConfirmationDialogService } from '@/app/services/confirmation-dialog.service';
import { AuthStore } from '@/app/store/auth/auth.store';
import { SCHEDULE_DAY_MAP } from '@/app/constants/schedule-days.constant';
import { AttendanceScheduleDays, PostAttendance, GetAttendance, AttendanceStatus } from '@/app/types/attendaces/attendances.types';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-attendances',
  templateUrl: './attendances.component.html',
  styleUrl: './attendances.component.scss',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    AttendanceTableComponent,
    FormsModule,
    ReactiveFormsModule
  ],
})
export class AttendancesComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly dispatcher = inject(Dispatcher);
  private readonly authService = inject(AuthService);
  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  private readonly attendancesStore = inject(AttendancesStore);
  private readonly authStore = inject(AuthStore);

  public readonly statusFilter = model<AttendanceStatus>('active');

  public readonly searchQuery = model<string>('');

  private currentUserId: string | null = null;

  public readonly attendances = computed(() =>
    this.attendancesStore.attendances().map(attendance => ({
      id: attendance.id,
      name: attendance.name,
      code: attendance.code,
      status: attendance.status,
      scheduleDays: this.backendDaysToFrontendDays(attendance.schedule_days),
      description: attendance.description ?? '',
      lateThreshold: attendance.late_threshold,
      createdAt: attendance.created_at,
      createdBy: attendance.created_by.id,
    }))
  );

  public readonly loading = computed(() => this.attendancesStore.loading());

  public ngOnInit(): void {
    this.loadUserAndAttendances();
  }

  public searchAttendances(query: string): void {
    this.searchQuery.set(query);
    this.dispatcher.dispatch(AttendancesEvents.searchAttendances({ q: this.searchQuery() ?? '' }));
  }

  public clearSearchAttendances(): void {
    this.searchQuery.set('');
    this.dispatcher.dispatch(AttendancesEvents.searchAttendances({ q: '' }));
  }

  public filterAttendancesByStatus(status: AttendanceStatus): void {
    this.statusFilter.set(status);
    this.dispatcher.dispatch(AttendancesEvents.filterAttendances({ status }));
  }

  public filterAttendances(): void {
    this.dispatcher.dispatch(AttendancesEvents.filterAttendances({ status: this.statusFilter() }));
  }

  private async loadUserAndAttendances(): Promise<void> {
    try {
      const user = await this.authService.getMe();
      this.currentUserId = user.id;
      this.dispatcher.dispatch(AttendancesEvents.loadAttendances());
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  }

  public openAddAttendance(): void {
    const dialogRef = this.dialog.open(AttendanceFormModalComponent, {
      maxWidth: '620px',
      width: '100%',
      height: 'auto',
      autoFocus: 'first-tabbable',
    });

    dialogRef.afterClosed().subscribe((data: AttendanceFormModel | undefined) => {
      if (data && this.currentUserId) {
        this.submitAttendance(data);
      }
    });
  }

  private submitAttendance(formData: AttendanceFormModel): void {
    if (!this.currentUserId) {
      console.error('User ID not available');
      return;
    }

    const backendPayload: PostAttendance = {
      id: crypto.randomUUID(),
      name: formData.name,
      code: formData.code,
      status: 'active',
      schedule_days: formData.scheduleDays.map(day => SCHEDULE_DAY_MAP[day] as AttendanceScheduleDays[number]),
      description: formData.description,
      late_threshold: formData.lateThreshold,
      configurations: {
        present_point: 1,
        late_point: 0.5,
        absent_point: 0,
        excused_point: 0.75,
      },
      created_by: this.currentUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.dispatcher.dispatch(AttendancesEvents.createAttendance(backendPayload));
  }

  private backendDaysToFrontendDays(days: string[]): string[] {
    return days.map(day => SCHEDULE_DAY_MAP[day] || day);
  }

  public async onArchiveAttendance(attendanceId: string): Promise<void> {
    const attendance = this.attendancesStore.attendancesMap()[attendanceId];
    if (!attendance) return;

    const confirmed = await this.confirmationDialogService.confirm({
      title: 'Archive Attendance',
      message: `Are you sure you want to archive <strong>${attendance.name}</strong>? This attendance will move to the archived list and will not be visible to the users.`,
      positiveButtonText: 'Archive',
      negativeButtonText: 'Cancel',
    });

    if (confirmed) {
      this.dispatcher.dispatch(AttendancesEvents.archiveAttendance(attendance));
    }
  }

  public async onSetAttendanceAsActive(attendanceId: string): Promise<void> {
    const attendance = this.attendancesStore.attendancesMap()[attendanceId];
    if (!attendance) return;

    const confirmed = await this.confirmationDialogService.confirm({
      title: 'Set Attendance as Active',
      message: `Are you sure you want to set <strong>${attendance.name}</strong> as active?`,
      positiveButtonText: 'Set as Active',
      negativeButtonText: 'Cancel',
    });

    if (confirmed) {
      this.dispatcher.dispatch(AttendancesEvents.setAttendanceAsActive(attendance));
    }
  }
}