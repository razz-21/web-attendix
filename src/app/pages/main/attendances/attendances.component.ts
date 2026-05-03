import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
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
import { SCHEDULE_DAY_MAP } from '@/app/constants/schedule-days.constant';
import { AttendanceScheduleDays, PostAttendance, GetAttendance } from '@/app/types/attendaces/attendances.types';

@Component({
  selector: 'app-attendances',
  templateUrl: './attendances.component.html',
  styleUrl: './attendances.component.scss',
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatSelectModule, AttendanceTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendancesComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly dispatcher = inject(Dispatcher);
  private readonly authService = inject(AuthService);
  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  private readonly attendancesStore = inject(AttendancesStore);

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
    }))
  );

  public readonly searchQuery = signal('');
  public readonly statusFilter = signal<'Active' | 'Archived'>('Active');

  public readonly filteredAttendances = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    let filtered = this.attendances();

    if (q) {
      filtered = filtered.filter(a => a.name.toLowerCase().includes(q));
    }

    filtered = filtered.filter(a => a.status === status);
    return filtered;
  });

  private currentUserId: string | null = null;

  public ngOnInit(): void {
    this.loadUserAndAttendances();
  }

  private async loadUserAndAttendances(): Promise<void> {
    try {
      const user = await this.authService.getMe();
      this.currentUserId = user.id;
      // Load attendances from store
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

    const eme = formData.scheduleDays.map(day => SCHEDULE_DAY_MAP[day]);
    const backendPayload: PostAttendance = {
      id: crypto.randomUUID(),
      name: formData.name,
      code: formData.code,
      status: 'Active',
      schedule_days: formData.scheduleDays.map(day => SCHEDULE_DAY_MAP[day] as AttendanceScheduleDays[number]),
      description: formData.description,
      late_threshold: formData.lateThreshold,
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
      message: `Are you sure you want to archive <strong>${attendance.name}</strong>? This action can be undone.`,
      positiveButtonText: 'Archive',
      negativeButtonText: 'Cancel',
    });

    if (confirmed) {
      this.dispatcher.dispatch(AttendancesEvents.archiveAttendance(attendance));
    }
  }
}