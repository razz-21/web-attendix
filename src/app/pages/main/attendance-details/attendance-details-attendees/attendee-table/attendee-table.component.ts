import {
  Component,
  computed,
  inject,
  signal,
  input,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { GetAttendee } from '@/app/types/attendaces/attendees.types';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogService } from '@/app/services/confirmation-dialog.service';
import { DEPARTMENTS } from '@/app/constants/departments.constant';
import { AttendeeFormModalComponent } from '@/app/pages/main/attendance-details/attendance-details-attendees/attendee-form-modal/attendee-form-modal.component';
import { AttendanceAttendeeStore } from '@/app/store/attendance-attendee/attendance-attendee.store';
import { AttendanceDetailsStore } from '@/app/store/attendance-details/attendance-details.store';
import { Dispatcher } from '@ngrx/signals/events';
import { AttendanceAttendeeEvents } from '@/app/store/attendance-attendee/attendance-attendee.events';

@Component({
  selector: 'app-attendee-table',
  templateUrl: './attendee-table.component.html',
  styleUrls: ['./attendee-table.component.scss'],
  imports: [
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    FormsModule,
  ],
})
export class AttendeeTableComponent {
  private readonly dialog = inject(MatDialog);
  private readonly dispatcher = inject(Dispatcher);
  private readonly attendanceAttendeeStore = inject(AttendanceAttendeeStore);
  private readonly attendanceDetailsStore = inject(AttendanceDetailsStore);
  private readonly confirmationDialogService = inject(ConfirmationDialogService);

  public readonly attendanceId = input.required<string>();

  protected readonly displayedColumns = ['select', 'rfid', 'name', 'department', 'year_level', 'section', 'actions'];
  protected readonly loadingRowColumns = ['loading'];

  public readonly loading = computed(() => this.attendanceAttendeeStore.loading());
  public readonly selectedAttendeeIds = computed(() => this.attendanceAttendeeStore.selectedAttendeeIds());

  public readonly allVisibleSelected = computed(() => {
    const visibleIds = this.data().map((attendee) => attendee.id);
    const selected = this.selectedAttendeeIds();
    return visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));
  });

  public readonly someVisibleSelected = computed(() => {
    const visibleIds = this.data().map((attendee) => attendee.id);
    const selected = this.selectedAttendeeIds();
    const selectedVisible = visibleIds.filter((id) => selected.includes(id));
    return selectedVisible.length > 0 && selectedVisible.length < visibleIds.length;
  });

  public readonly filters = signal<{ q?: string }>({ q: undefined });

  public readonly data = computed(() => this.attendanceAttendeeStore.filteredAttendees());

  public readonly isArchived = computed(() => this.attendanceDetailsStore.attendanceDetails()?.status === 'archived');

  public readonly tableColumns = computed(() =>
    this.isArchived()
      ? ['rfid', 'name', 'department', 'year_level', 'section', 'actions']
      : this.displayedColumns
  );

  public readonly departments = DEPARTMENTS;

  public searchAttendees(): void {
    this.dispatcher.dispatch(AttendanceAttendeeEvents.searchAttendees({ q: this.filters().q ?? '' }));
  }

  public isAttendeeSelected(attendeeId: string): boolean {
    return this.selectedAttendeeIds().includes(attendeeId);
  }

  public toggleAttendeeSelection(attendeeId: string): void {
    this.dispatcher.dispatch(AttendanceAttendeeEvents.toggleAttendeeSelection({ attendee_id: attendeeId }));
  }

  public toggleAllAttendees(): void {
    const visibleIds = this.data().map((attendee) => attendee.id);
    this.dispatcher.dispatch(AttendanceAttendeeEvents.toggleAllAttendeesSelection({ visible_ids: visibleIds }));
  }

  public openEdit(row: GetAttendee): void {
    this.dialog.open(AttendeeFormModalComponent, {
      maxWidth: '720px',
      width: '100%',
      data: { attendanceId: this.attendanceId(), attendee: row },
    });
  }

  public async deleteAttendee(row: GetAttendee): Promise<void> {
    const confirmed = await this.confirmationDialogService.confirm({
      title: 'Delete attendee',
      message: `Are you sure you want to delete <strong>${row.name}</strong>?`,
      positiveButtonText: 'Yes, delete',
      negativeButtonText: 'No, cancel',
    });

    if (!confirmed) return;

    this.dispatcher.dispatch(AttendanceAttendeeEvents.deleteAttendee({
      attendance_id: this.attendanceId(),
      attendee: row,
    }));
  }
}