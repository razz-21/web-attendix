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
import { FormsModule } from '@angular/forms';
import { AttendeesService } from '@/app/services/attendees.service';
import { GetAttendee } from '@/app/types/attendaces/attendees.types';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogService } from '@/app/services/confirmation-dialog.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DEPARTMENTS } from '@/app/constants/departments.constant';
import { AttendeeFormModalComponent } from '@/app/pages/main/attendance-details/attendance-details-attendees/attendee-form-modal/attendee-form-modal.component';
import { AttendanceAttendeeStore } from '@/app/store/attendance-attendee/attendance-attendee.store';
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
    FormsModule,
  ],
})
export class AttendeeTableComponent {
  private readonly attendeesService = inject(AttendeesService);
  private readonly dialog = inject(MatDialog);
  private readonly dispatcher = inject(Dispatcher);
  private readonly attendanceAttendeeStore = inject(AttendanceAttendeeStore);
  private readonly confirmationDialogService = inject(ConfirmationDialogService);

  public readonly attendanceId = input.required<string>();

  protected readonly displayedColumns = ['rfid', 'name', 'department', 'year_level', 'section', 'actions'];
  protected readonly loadingRowColumns = ['loading'];

  public readonly loading = computed(() => this.attendanceAttendeeStore.loading());

  public readonly filters = signal<{ q?: string }>({ q: undefined });

  public readonly data = computed(() => this.attendanceAttendeeStore.filteredAttendees());

  public readonly departments = DEPARTMENTS;

  public openCreate(): void {
    const ref = this.dialog.open(AttendeeFormModalComponent, {
      maxWidth: '720px',
      width: '100%',
      data: { attendanceId: this.attendanceId() },
    });
  }

  public searchAttendees(): void {
    this.dispatcher.dispatch(AttendanceAttendeeEvents.searchAttendees({ q: this.filters().q ?? '' }));
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