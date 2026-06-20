import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { AttendanceStore } from '@/app/store/attendance/attendance.store';
import { AttendanceDetailsStore } from '@/app/store/attendance-details/attendance-details.store';
import { AttendanceEvents } from '@/app/store/attendance/attendance.events';
import { Dispatcher } from '@ngrx/signals/events';
import { GetAttendance } from '@/app/types/attendance/attendance.types';
import { ConfirmationDialogService } from '@/app/services/confirmation-dialog.service';
import { EditAttendanceModalComponent } from '../edit-attendance-form-modal/edit-attendance-form-modal.component';
import { AttendanceQrcodeModalComponent } from '../attendance-qrcode-modal/attendance-qrcode-modal.component';

@Component({
  selector: 'app-attendance-details-table',
  templateUrl: './attendance-details-table.component.html',
  styleUrl: './attendance-details-table.component.scss',
  imports: [
    DatePipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    FormsModule,
  ],
})
export class AttendanceTableComponent {
  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  private readonly attendanceRecordsStore = inject(AttendanceStore);
  private readonly attendanceDetailsStore = inject(AttendanceDetailsStore);
  private readonly dispatcher = inject(Dispatcher);
  private readonly dialog = inject(MatDialog);

  protected readonly displayedColumns: string[] = [
    'name',
    'attendance_date',
    'start_time',
    'end_time',
    'created_at',
    'actions',
  ];
  protected readonly loadingRowColumns: string[] = ['loading'];

  public readonly loading = computed(() => this.attendanceRecordsStore.loading());
  public readonly filteredAttendance = computed(() => this.attendanceRecordsStore.filteredAttendance());
  public readonly filters = computed(() => this.attendanceRecordsStore.filters());
  public readonly data = computed(() => this.filteredAttendance());
  public readonly isArchived = computed(() => this.attendanceDetailsStore.attendanceDetails()?.status === 'archived');

  public readonly isLoading = (_index: number, _row: any) => this.loading();
  public readonly isNotLoading = (_index: number, _row: any) => !this.loading();

  public searchDetails(): void {
    this.dispatcher.dispatch(AttendanceEvents.searchAttendance({
      q: this.filters().q ?? '',
    }));
  }

  public selectAttendance(row: GetAttendance): void {
    this.dispatcher.dispatch(AttendanceEvents.selectAttendance({ attendance: row }));
  }

  public openEditDetails(row: GetAttendance): void {
    this.dialog.open(EditAttendanceModalComponent, {
      maxWidth: '620px',
      width: '100%',
      data: row,
    });
  }

  public openQrCode(row: GetAttendance): void {
    this.dialog.open(AttendanceQrcodeModalComponent, {
      maxWidth: '520px',
      width: '100%',
      data: row,
    });
  }

  public async deleteDetails(row: GetAttendance): Promise<void> {
    const result = await this.confirmationDialogService.confirm({
      title: 'Delete Attendance Record',
      message: `Are you sure you want to delete <strong>${row.name}</strong>?`,
      positiveButtonText: 'Yes, delete',
      negativeButtonText: 'No, cancel',
    });

    if (result) {
      this.dispatcher.dispatch(AttendanceEvents.deleteAttendance({
        attendance_id: row.attendance_id, 
        attendance: row,
      }));
    }
  }
}