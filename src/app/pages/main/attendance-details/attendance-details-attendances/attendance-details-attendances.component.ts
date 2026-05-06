import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Dispatcher } from '@ngrx/signals/events';
import { AttendanceRecordsStore } from '@/app/store/attendance-records/attendance-records.store';
import { AttendanceRecordsEvents } from '@/app/store/attendance-records/attendance-records.events';
import { AttendanceRecordTableComponent } from '../attendance-details-attendances/attendance-details-table/attendance-details-table.component';
import { AttendanceRecordFormModalComponent } from '../attendance-details-attendances/attendance-details-form-modal/attendance-details-form-modal.component';
import type { GetAttendanceRecord } from '@/app/types/attendance-records/attendance-records.types';

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
  private readonly attendanceRecordsStore = inject(AttendanceRecordsStore);
  private readonly route = inject(ActivatedRoute);

  private get attendanceId(): string {
    return this.route.parent?.snapshot.paramMap.get('id') ?? '';
  }

  public ngOnInit(): void {
    this.dispatcher.dispatch(AttendanceRecordsEvents.loadAttendanceRecords({
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
}