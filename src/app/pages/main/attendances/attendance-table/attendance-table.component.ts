import { Component, computed, input, inject, output } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AttendanceStatus } from '@/app/types/attendaces/attendances.types';
import { MAIN_ATTENDANCE_DETAILS_PATH } from '@/app/constants/route.constant';
import { Router } from '@angular/router';
import { AuthStore } from '@/app/store/auth/auth.store';
import { AttendancesStore } from '@/app/store/attendances/attendances.store';
import { AttendancesEvents } from '@/app/store/attendances/attendances.events';
import { Dispatcher } from '@ngrx/signals/events';
import { ConfirmationDialogService } from '@/app/services/confirmation-dialog.service';

export interface Attendance {
  id: string;
  name: string;
  code: string;
  status: AttendanceStatus;
  scheduleDays: string[];
  description: string;
  lateThreshold: number;
  createdAt: string;
  createdBy: string;
  isSharedWithMe?: boolean;
}

@Component({
  selector: 'app-attendance-table',
  templateUrl: './attendance-table.component.html',
  styleUrl: './attendance-table.component.scss',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    DatePipe,
    TitleCasePipe,
  ],
})
export class AttendanceTableComponent {
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly attendancesStore = inject(AttendancesStore);
  private readonly dispatcher = inject(Dispatcher);
  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  private readonly snackBar = inject(MatSnackBar);

  public readonly attendances = input<Attendance[]>([]);
  public readonly loading = input<boolean>(false);

  public readonly attendanceArchived = output<string>();
  public readonly attendanceSetAsActive = output<string>();
  public readonly attendanceEdited = output<Attendance>();

  public readonly displayedColumns = ['select', 'name', 'code', 'scheduleDays', 'lateThreshold', 'status', 'createdAt', 'actions'];
  public readonly loadingRowColumns = ['loading'];

  public readonly hasAttendances = computed(() => this.attendances().length > 0);
  public readonly currentUser = computed(() => this.authStore.user());
  public readonly selectedAttendanceIds = computed(() => this.attendancesStore.selectedAttendanceIds());
  public readonly selectedCount = computed(() => this.attendancesStore.selectedCount());
  public readonly bulkDeleteLoading = computed(() => this.attendancesStore.bulkDeleteLoading());

  public readonly manageableAttendances = computed(() =>
    this.attendances().filter((attendance) => this.canManage(attendance))
  );

  public readonly hasManageableAttendances = computed(() => this.manageableAttendances().length > 0);

  public readonly allSelected = computed(() => {
    const manageableIds = this.manageableAttendances().map((attendance) => attendance.id);
    const selected = this.selectedAttendanceIds();
    return manageableIds.length > 0 && manageableIds.every((id) => selected.includes(id));
  });

  public readonly someSelected = computed(() => {
    const manageableIds = this.manageableAttendances().map((attendance) => attendance.id);
    const selected = this.selectedAttendanceIds();
    const selectedManageable = manageableIds.filter((id) => selected.includes(id));
    return selectedManageable.length > 0 && selectedManageable.length < manageableIds.length;
  });

  public canManage(attendance: Attendance): boolean {
    const userId = this.currentUser()?.id;
    if (!userId) return false;
    return attendance.createdBy === userId;
  }

  public isAttendanceSelected(attendanceId: string): boolean {
    return this.selectedAttendanceIds().includes(attendanceId);
  }

  public toggleAttendanceSelection(attendance: Attendance): void {
    this.dispatcher.dispatch(AttendancesEvents.toggleAttendanceSelection({ attendance_id: attendance.id }));
  }

  public toggleAllAttendances(): void {
    const manageableIds = this.manageableAttendances().map((attendance) => attendance.id);
    this.dispatcher.dispatch(AttendancesEvents.toggleAllAttendancesSelection({ manageable_ids: manageableIds }));
  }

  public async bulkDeleteAttendances(): Promise<void> {
    const selectedIds = this.selectedAttendanceIds();
    if (!selectedIds.length) return;

    const attendances = selectedIds
      .map((id) => this.attendancesStore.attendancesMap()[id])
      .filter((attendance): attendance is NonNullable<typeof attendance> => !!attendance);

    if (!attendances.length) return;

    const confirmed = await this.confirmationDialogService.confirm({
      title: 'Delete attendances',
      message: `Are you sure you want to delete <strong>${attendances.length}</strong> selected attendance(s)? This action cannot be undone.`,
      positiveButtonText: 'Yes, delete',
      negativeButtonText: 'No, cancel',
    });

    if (confirmed) {
      this.dispatcher.dispatch(AttendancesEvents.bulkDeleteAttendances({ attendances }));
    }
  }

  public onEditAttendance(attendance: Attendance, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (attendance.status === 'archived') {
      return;
    }

    this.attendanceEdited.emit(attendance);
  }

  public onArchiveAttendance(attendance: Attendance, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (attendance.status === 'archived') {
      return;
    }

    this.attendanceArchived.emit(attendance.id);
  }

  public onSetAttendanceAsActive(attendance: Attendance, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (attendance.status === 'active') {
      return;
    }

    this.attendanceSetAsActive.emit(attendance.id);
  }

  public onAttendanceClick(attendance: Attendance): void {
    const path = MAIN_ATTENDANCE_DETAILS_PATH.replace(':id', attendance.id);
    this.router.navigate([path]);
  }

  public copyCode(code: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    navigator.clipboard.writeText(code);
    this.snackBar.open('Code copied to clipboard', 'Close', { duration: 5000 });
  }
}
