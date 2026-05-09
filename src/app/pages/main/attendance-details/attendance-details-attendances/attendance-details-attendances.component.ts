import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Dispatcher } from '@ngrx/signals/events';
import { AttendanceStore } from '@/app/store/attendance/attendance.store';
import { AttendanceEvents } from '@/app/store/attendance/attendance.events';
import { AttendanceRecordTableComponent } from '../attendance-details-attendances/attendance-details-table/attendance-details-table.component';
import { AttendanceRecordFormModalComponent } from '../attendance-details-attendances/attendance-details-form-modal/attendance-details-form-modal.component';
import type { GetAttendanceRecord } from '@/app/types/attendance/attendance.types';
import { EditAttendanceRecordModalComponent } from '../attendance-details-attendances/edit-attendance-form-modal/edit-attendance-form-modal.component';

@Component({
  selector: 'app-attendance-details-attendances',
  templateUrl: './attendance-details-attendances.component.html',
  styleUrls: ['./attendance-details-attendances.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, AttendanceRecordTableComponent],
})
export class AttendanceDetailsAttendancesComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly dispatcher = inject(Dispatcher);
  private readonly attendanceRecordsStore = inject(AttendanceStore);
  private readonly route = inject(ActivatedRoute);

  private get attendanceId(): string {
    return this.route.parent?.snapshot.paramMap.get('id') ?? '';
  }

  public ngOnInit(): void {
    this.dispatcher.dispatch(AttendanceEvents.loadAttendanceRecords({
      attendance_id: this.attendanceId,
    }));
  }

  public openAddRecord(): void {
    this.dialog.open<AttendanceRecordFormModalComponent, undefined, GetAttendanceRecord | undefined>(
      AttendanceRecordFormModalComponent,
      {
        maxWidth: '620px',
        width: '100%',
        height: 'auto',
        autoFocus: 'first-tabbable',
      }
    );
  }

  public openEditDetails(row: GetAttendanceRecord): void {
    this.dialog.open(EditAttendanceRecordModalComponent, {
      maxWidth: '620px',
      width: '100%',
      data: row, 
    });
  }
}