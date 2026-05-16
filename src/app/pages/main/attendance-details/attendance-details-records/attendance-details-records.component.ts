import { DatePipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { Dispatcher } from '@ngrx/signals/events';
import { AttendanceAttendeeStore } from '@/app/store/attendance-attendee/attendance-attendee.store';
import {
  AttendanceRecordStore,
  AttendanceRecordViewMode,
} from '@/app/store/attendance-record/attendance-record.store';
import { AttendanceStore } from '@/app/store/attendance/attendance.store';
import { AttendanceDetailsStore } from '@/app/store/attendance-details/attendance-details.store';
import { AttendanceRecordEvents } from '@/app/store/attendance-record/attendance-record.events';
import {
  AttendanceRecordStatus,
  GetAttendanceRecord,
} from '@/app/types/attendance-record/attendance-record.types';
import { AttendanceConfigurations } from '@/app/types/attendaces/attendances.types';
import { GetAttendee } from '@/app/types/attendaces/attendees.types';
import { GetAttendance } from '@/app/types/attendance/attendance.types';
import { ExcusedReasonModalComponent } from '../attendance-details-attendances/attendance-drawer/excused-reason-modal/excused-reason-modal.component';

const STATUS_LABELS: Record<AttendanceRecordStatus, string> = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  excused: 'Excused',
};

const STATUS_OPTIONS: { value: AttendanceRecordStatus; label: string }[] = [
  { value: 'present', label: STATUS_LABELS.present },
  { value: 'late', label: STATUS_LABELS.late },
  { value: 'absent', label: STATUS_LABELS.absent },
  { value: 'excused', label: STATUS_LABELS.excused },
];

const DEFAULT_POINT_CONFIG: AttendanceConfigurations = {
  present_point: 1,
  late_point: 0.5,
  absent_point: 0,
  excused_point: 0.75,
};

const STATUS_POINT_KEYS: Record<
  AttendanceRecordStatus,
  keyof AttendanceConfigurations
> = {
  present: 'present_point',
  late: 'late_point',
  absent: 'absent_point',
  excused: 'excused_point',
};

@Component({
  selector: 'app-attendance-details-records',
  templateUrl: './attendance-details-records.component.html',
  styleUrls: ['./attendance-details-records.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
  imports: [
    DatePipe,
    NgClass,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatButtonToggleModule,
  ],
})
export class AttendanceDetailsRecordsComponent {
  private readonly attendanceStore = inject(AttendanceStore);
  private readonly attendanceAttendeeStore = inject(AttendanceAttendeeStore);
  private readonly attendanceRecordStore = inject(AttendanceRecordStore);
  private readonly attendanceDetailsStore = inject(AttendanceDetailsStore);
  private readonly dispatcher = inject(Dispatcher);
  private readonly dialog = inject(MatDialog);

  protected readonly statusLabels = STATUS_LABELS;
  protected readonly statusOptions = STATUS_OPTIONS;

  protected readonly viewMode = this.attendanceRecordStore.viewMode;

  protected readonly filterStartDate = signal<Date | null>(null);
  protected readonly filterEndDate = signal<Date | null>(null);
  protected readonly dateRangeInputKey = signal(0);

  protected readonly pointConfig = computed((): AttendanceConfigurations => {
    const configurations =
      this.attendanceDetailsStore.attendanceDetails()?.configurations;
    return configurations ?? DEFAULT_POINT_CONFIG;
  });

  protected readonly hasDateRangeFilter = computed(
    () => this.filterStartDate() !== null || this.filterEndDate() !== null,
  );

  protected readonly allAttendances = computed(() => this.attendanceStore.records());

  protected readonly attendances = computed(() => {
    const records = this.allAttendances();
    const start = this.filterStartDate();
    const end = this.filterEndDate();

    if (!start && !end) {
      return records;
    }

    return records.filter((attendance) => {
      const date = attendance.attendance_date;
      if (start && date < this.toDateKey(start)) {
        return false;
      }
      if (end && date > this.toDateKey(end)) {
        return false;
      }
      return true;
    });
  });
  protected readonly attendees = computed(() => this.attendanceAttendeeStore.attendees());

  protected readonly attendancesId = computed(
    () => this.attendanceDetailsStore.attendanceDetails()?.id ?? '',
  );

  protected readonly loading = computed(
    () =>
      this.attendanceStore.loading() ||
      this.attendanceAttendeeStore.loading() ||
      this.attendanceRecordStore.loading(),
  );

  protected readonly saving = computed(
    () =>
      this.attendanceRecordStore.createLoading() ||
      this.attendanceRecordStore.updateLoading(),
  );

  private readonly recordLookup = computed(() => {
    const map = new Map<string, GetAttendanceRecord>();
    for (const record of this.attendanceRecordStore.attendanceRecords()) {
      map.set(`${record.attendance_id}:${record.attendee_id}`, record);
    }
    return map;
  });

  protected readonly displayedColumns = computed(() => [
    'attendee',
    'total',
    'avg',
    ...this.attendances().map((attendance) => this.attendanceColumnId(attendance.id)),
  ]);

  protected readonly loadingRowColumns = ['loading'];

  protected readonly isLoading = (_index: number, _row: unknown) => this.loading();
  protected readonly isNotLoading = (_index: number, _row: unknown) => !this.loading();

  protected attendanceColumnId(attendanceId: string): string {
    return `attendance_${attendanceId}`;
  }

  protected clearDateRangeFilter(): void {
    this.filterStartDate.set(null);
    this.filterEndDate.set(null);
    this.dateRangeInputKey.update((key) => key + 1);
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  protected getRecord(
    attendeeId: string,
    attendanceId: string,
  ): GetAttendanceRecord | undefined {
    return this.recordLookup().get(`${attendanceId}:${attendeeId}`);
  }

  protected getRecordStatus(
    attendeeId: string,
    attendanceId: string,
  ): AttendanceRecordStatus | null {
    return this.getRecord(attendeeId, attendanceId)?.status ?? null;
  }

  protected getRecordPointsValue(
    attendeeId: string,
    attendanceId: string,
  ): number {
    const status = this.getRecordStatus(attendeeId, attendanceId);
    if (!status) {
      return 0;
    }

    const config = this.pointConfig();
    return config[STATUS_POINT_KEYS[status]];
  }

  protected getAttendeeTotalPoints(attendeeId: string): number {
    return this.attendances().reduce(
      (sum, attendance) => sum + this.getRecordPointsValue(attendeeId, attendance.id),
      0,
    );
  }

  protected getAttendeeMaxTotalPoints(): number {
    const count = this.attendances().length;
    if (count === 0) {
      return 0;
    }

    return count * this.pointConfig().present_point;
  }

  protected getAttendeeAverageAttendance(attendeeId: string): number {
    const maxTotalPoints = this.getAttendeeMaxTotalPoints();
    if (maxTotalPoints === 0) {
      return 0;
    }

    return (this.getAttendeeTotalPoints(attendeeId) / maxTotalPoints) * 100;
  }

  protected formatPoints(points: number): string {
    return Number.isInteger(points) ? String(points) : points.toFixed(2).replace(/\.?0+$/, '');
  }

  protected formatAttendancePercent(percent: number): string {
    const rounded = Math.round(percent * 100) / 100;
    const value = Number.isInteger(rounded)
      ? String(rounded)
      : rounded.toFixed(2).replace(/\.?0+$/, '');
    return `${value}%`;
  }

  protected setViewMode(viewMode: AttendanceRecordViewMode): void {
    this.attendanceRecordStore.setViewMode(viewMode);
  }

  protected statusSelectClass(
    attendeeId: string,
    attendanceId: string,
  ): string {
    const status = this.getRecordStatus(attendeeId, attendanceId) ?? 'unset';
    return `records-status-select--${status}`;
  }

  protected onStatusChange(
    status: AttendanceRecordStatus,
    attendee: GetAttendee,
    attendance: GetAttendance,
  ): void {
    const record = this.getRecord(attendee.id, attendance.id);
    const attendancesId = this.attendancesId();

    if (!attendancesId) {
      return;
    }

    if (record) {
      if (record.status === status) {
        return;
      }

      this.dispatcher.dispatch(
        AttendanceRecordEvents.updateAttendanceRecord({
          attendances_id: attendancesId,
          id: record.id,
          payload: { status },
        }),
      );

      if (status === 'excused') {
        this.openExcusedModal(record);
      }

      return;
    }

    this.dispatcher.dispatch(
      AttendanceRecordEvents.createAttendanceRecord({
        attendances_id: attendancesId,
        payload: {
          id: crypto.randomUUID(),
          attendances_id: attendancesId,
          attendance_id: attendance.id,
          attendee_id: attendee.id,
          status,
          reason_type: null,
          reason: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }),
    );
  }

  protected openExcusedModal(record: GetAttendanceRecord): void {
    this.dialog.open(ExcusedReasonModalComponent, {
      maxWidth: '500px',
      width: '100%',
      data: {
        attendances_id: this.attendancesId(),
        record,
      },
    });
  }
}
