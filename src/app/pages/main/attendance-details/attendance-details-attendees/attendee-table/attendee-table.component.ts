import {
  Component,
  computed,
  inject,
  signal,
  input,
  effect,
  untracked,
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
  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  private readonly snackBar = inject(MatSnackBar);

  public readonly attendanceId = input.required<string>();

  protected readonly displayedColumns = ['rfid', 'name', 'department', 'year_level', 'section', 'actions'];
  protected readonly loadingRowColumns = ['loading'];

  private readonly rawAttendees = signal<GetAttendee[]>([]);
  public readonly loading = signal<boolean>(false);
  public readonly filters = signal<{ q?: string }>({ q: undefined });

  public readonly data = computed(() => [...this.rawAttendees()]);
  public readonly departments = DEPARTMENTS;

  constructor() {
    // Watch for attendanceId changes and reload data.
    // untracked() prevents signals read inside loadAttendees (pagination, filters)
    // from re-triggering this effect and causing an infinite loop.
    effect(() => {
      const id = this.attendanceId();
      if (id) {
        untracked(() => this.loadAttendees());
      }
    });
  }

  public async loadAttendees(): Promise<void> {
    const id = this.attendanceId();
    if (!id) return;

    this.loading.set(true);

    try {
      const { q } = this.filters();
      const resp = await this.attendeesService.getAttendeesByAttendance(id, {q,});
      this.rawAttendees.set(resp.data ?? []);
    } catch (err: any) {
      console.error('[AttendeeTable] loadAttendees error:', err);
      this.snackBar.open(err?.message ?? 'Failed to load attendees', 'Close', {
        duration: 6000,
      });
    } finally {
      this.loading.set(false);
    }
  }

  public searchAttendees(): void {
    this.loadAttendees();
  }

  public openCreate(): void {
    const ref = this.dialog.open(AttendeeFormModalComponent, {
      maxWidth: '720px',
      width: '100%',
      data: { attendanceId: this.attendanceId() },
    });
    ref.afterClosed().subscribe((res: GetAttendee | undefined) => {
      if (res) this.loadAttendees();
    });
  }

  public openEdit(row: GetAttendee): void {
    const ref = this.dialog.open(AttendeeFormModalComponent, {
      maxWidth: '720px',
      width: '100%',
      data: { attendanceId: this.attendanceId(), attendee: row },
    });
    ref.afterClosed().subscribe((res: GetAttendee | undefined) => {
      if (res) this.loadAttendees();
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

    try {
      await this.attendeesService.deleteAttendee(this.attendanceId(), row.id);
      this.snackBar.open('Attendee deleted', 'Close', { duration: 4000 });
      this.loadAttendees();
    } catch (err: any) {
      console.error('[AttendeeTable] deleteAttendee error:', err);
      this.snackBar.open(err?.message ?? 'Failed to delete attendee', 'Close', {
        duration: 6000,
      });
      this.loadAttendees();
    }
  }
}