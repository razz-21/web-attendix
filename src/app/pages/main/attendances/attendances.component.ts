import { Component, inject, OnInit, computed, model } from '@angular/core';
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
import { ConfirmationDialogService } from '@/app/services/confirmation-dialog.service';
import { AuthStore } from '@/app/store/auth/auth.store';
import { SCHEDULE_DAY_MAP, sortScheduleDays } from '@/app/constants/schedule-days.constant';
import { AttendanceStatus } from '@/app/types/attendaces/attendances.types';
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
  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  private readonly attendancesStore = inject(AttendancesStore);
  private readonly authStore = inject(AuthStore);

  public readonly statusFilter = model<AttendanceStatus>(this.attendancesStore.filters().status ?? 'active');

  public readonly searchQuery = model<string>('');

  public readonly attendances = computed(() => {
    const userId = this.authStore.user()?.id;

    return this.attendancesStore.attendances().map((attendance) => ({
      id: attendance.id,
      name: attendance.name,
      code: attendance.code,
      status: attendance.status,
      scheduleDays: this.backendDaysToFrontendDays(attendance.schedule_days),
      description: attendance.description ?? '',
      lateThreshold: attendance.late_threshold,
      createdAt: attendance.created_at,
      createdBy: attendance.created_by.id,
      isSharedWithMe:
        !!userId &&
        attendance.created_by.id !== userId &&
        (attendance.shared_with ?? []).includes(userId),
    }));
  });

  public readonly loading = computed(() => this.attendancesStore.loading());

  public readonly attendancesLoaded = computed(() => this.attendancesStore.attendancesLoaded());

  public ngOnInit(): void {
    if (!this.attendancesLoaded()) {
      this.statusFilter.set(this.attendancesStore.filters().status ?? 'active');
      this.loadUserAndAttendances();
    }
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

  private loadUserAndAttendances(): void {
    if (this.attendancesStore.hasAttendances()) {
      // Entities are already cached in the root-scoped store (e.g., returning from
      // an attendance details view). `loadAttendances` is guarded to skip when
      // entities exist, so we explicitly re-fetch using the persisted filter to
      // keep the list in sync with the UI filter state.
      this.dispatcher.dispatch(
        AttendancesEvents.filterAttendances({ status: this.attendancesStore.filters().status ?? 'active' })
      );
    } else {
      this.dispatcher.dispatch(AttendancesEvents.loadAttendances());
    }
  }

  public openAddAttendance(): void {
    this.dialog.open(AttendanceFormModalComponent, {
      maxWidth: '620px',
      width: '100%',
      height: 'auto',
      autoFocus: 'first-tabbable',
    });
  }

  public onEditAttendance(attendanceData: any): void {
    const attendanceId = attendanceData.id;
    const attendance = this.attendancesStore.attendancesMap()[attendanceId];
    if (!attendance) return;

    const initialData: AttendanceFormModel = {
      name: attendance.name,
      code: attendance.code,
      description: attendance.description || '',
      lateThreshold: attendance.late_threshold,
      status: attendance.status === 'archived' ? 'Archived' : 'Active',
      scheduleDays: this.backendDaysToFrontendDays(attendance.schedule_days) as any
    };

    this.dialog.open(AttendanceFormModalComponent, {
      maxWidth: '620px',
      width: '100%',
      height: 'auto',
      autoFocus: 'first-tabbable',
      data: { initialData, attendanceId },
    });
  }

  private backendDaysToFrontendDays(days: string[]): string[] {
    const frontendDays = days.map(day => SCHEDULE_DAY_MAP[day] || day);
    return sortScheduleDays(frontendDays);
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