import { Component, inject, computed, signal } from '@angular/core';
import { AttendanceStore } from '@/app/store/attendance/attendance.store';
import { Dispatcher } from '@ngrx/signals/events';
import { AttendanceEvents } from '@/app/store/attendance/attendance.events';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { AvatarComponent } from '@/app/compponents/avatar/avatar.component';
import { AttendanceAttendeeStore } from '@/app/store/attendance-attendee/attendance-attendee.store';
import { AttendanceRecordStore } from '@/app/store/attendance-record/attendance-record.store';
import { AttendanceRecordStatus, GetAttendanceRecord } from '@/app/types/attendance-record/attendance-record.types';
import { GetAttendee } from '@/app/types/attendaces/attendees.types';
import { AttendanceRecordEvents } from '@/app/store/attendance-record/attendance-record.events';
import { AttendanceDetailsStore } from '@/app/store/attendance-details/attendance-details.store';
import { LoadingSectionComponent } from '@/app/compponents/loading-section/loading-section.component';
import { EmptySectionComponent } from '@/app/compponents/empty-section/empty-section.component';
import { DatePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ExcusedReasonModalComponent } from './excused-reason-modal/excused-reason-modal.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-attendance-drawer',
  templateUrl: './attendance-drawer.component.html',
  styleUrl: './attendance-drawer.component.scss',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatButtonToggleModule,
    MatTooltipModule,
    AvatarComponent,
    LoadingSectionComponent,
    EmptySectionComponent,
    DatePipe,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class AttendanceDrawerComponent {
  private readonly dispatcher = inject(Dispatcher);
  private readonly attendanceDetailsStore = inject(AttendanceDetailsStore);
  private readonly attendanceStore = inject(AttendanceStore);
  private readonly attendanceAttendeesStore = inject(AttendanceAttendeeStore);
  private readonly attendanceRecordStore = inject(AttendanceRecordStore);
  private readonly dialog = inject(MatDialog);

  public attendances_id = computed(() => this.attendanceDetailsStore.attendanceDetails()?.id ?? '');

  public drawerOpen = computed(() => this.attendanceStore.drawerOpen());

  public selectedAttendance = computed(() => this.attendanceStore.selectedAttendance());

  public isSessionInactive = computed(() => this.selectedAttendance()?.status === 'inactive');

  public attendees = computed(() => this.attendanceAttendeesStore.attendees());

  public attendessRecords = computed(() => this.attendanceRecordStore.attendeesAttendanceRecords(this.attendees() ?? [], this.selectedAttendance()?.id ?? ''));

  public loadingRecords = computed(() => this.attendanceRecordStore.loading());

  public searchQuery = signal('');

  public readonly filteredRecords = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.attendessRecords();
    return this.attendessRecords().filter(r =>
      r.attendee.name.toLowerCase().includes(q)
    );
  });

  public onStatusClick(status: AttendanceRecordStatus, attendeeRecord: { attendee: GetAttendee; attendanceRecord: GetAttendanceRecord | undefined }): void {
    if (attendeeRecord.attendanceRecord?.status === status) {
      return;
    }

    this.updateAttendanceRecord(status, attendeeRecord);
  }

  private updateAttendanceRecord(status: AttendanceRecordStatus, attendeeRecord: { attendee: GetAttendee; attendanceRecord: GetAttendanceRecord | undefined }): void {
    const attendancesId = this.attendances_id();
    const attendanceId = this.selectedAttendance()?.id ?? '';

    if (!attendancesId || !attendanceId) {
      return;
    }

    if (attendeeRecord.attendanceRecord) {
      this.dispatcher.dispatch(AttendanceRecordEvents.updateAttendanceRecord({
        attendances_id: attendancesId,
        id: attendeeRecord.attendanceRecord.id,
        payload: {
          status,
        },
      }));

      return;
    }

    this.dispatcher.dispatch(AttendanceRecordEvents.createAttendanceRecord({
      attendances_id: attendancesId,
      payload: {
        id: crypto.randomUUID(),
        attendances_id: attendancesId,
        attendance_id: attendanceId,
        attendee_id: attendeeRecord.attendee.id,
        status,
        reason_type: null,
        reason: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }));
  }

  public openExcusedModal(attendeeRecord: { attendee: GetAttendee; attendanceRecord: GetAttendanceRecord | undefined }): void {
    if (!attendeeRecord.attendanceRecord) return;
    this.dialog.open(ExcusedReasonModalComponent, {
      maxWidth: '500px',
      width: '100%',
      data: {
        attendances_id: this.attendances_id(),
        record: attendeeRecord.attendanceRecord,
      },
    });
  }

  public closeDrawer(): void {
    this.dispatcher.dispatch(AttendanceEvents.selectAttendance({ attendance: null }));
  }
}