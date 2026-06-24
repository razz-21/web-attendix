import { Component, inject, computed, signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { AttendeeTableComponent } from './attendee-table/attendee-table.component';
import { AttendeeFormModalComponent } from './attendee-form-modal/attendee-form-modal.component';
import { ImportAttendeesFormModalComponent } from './import-attendees-form-modal/import-attendees-form-modal.component';
import { ActivatedRoute } from '@angular/router';
import { AttendanceAttendeeEvents } from "@/app/store/attendance-attendee/attendance-attendee.events";
import { AttendanceAttendeeStore } from "@/app/store/attendance-attendee/attendance-attendee.store";
import { AttendanceDetailsStore } from "@/app/store/attendance-details/attendance-details.store";
import { ConfirmationDialogService } from "@/app/services/confirmation-dialog.service";
import { Dispatcher } from "@ngrx/signals/events";
import { GetAttendee } from "@/app/types/attendaces/attendees.types";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, tap, map } from "rxjs";
import { Events } from "@ngrx/signals/events";

@Component({
  selector: 'app-attendance-details-attendees',
  templateUrl: './attendance-details-attendees.component.html',
  styleUrls: ['./attendance-details-attendees.component.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    AttendeeTableComponent,
  ]
})
export class AttendanceDetailsAttendeesComponent {
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly events = inject(Events);
  private readonly dispatcher = inject(Dispatcher);
  private readonly attendanceDetailsStore = inject(AttendanceDetailsStore);
  private readonly attendanceAttendeeStore = inject(AttendanceAttendeeStore);
  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  
  private dialogRef = signal<MatDialogRef<AttendeeFormModalComponent> | null>(null);
  private importDialogRef = signal<MatDialogRef<ImportAttendeesFormModalComponent> | null>(null);
  
  // Get attendanceId from parent route params
  public readonly attendanceId = computed(() => {
    return this.route.parent?.snapshot.paramMap.get('id') ?? '';
  });

  public readonly isArchived = computed(() => this.attendanceDetailsStore.attendanceDetails()?.status === 'archived');
  public readonly selectedCount = computed(() => this.attendanceAttendeeStore.selectedCount());
  public readonly bulkDeleteLoading = computed(() => this.attendanceAttendeeStore.bulkDeleteLoading());

  public openCreate(): void {
    const ref = this.dialog.open(AttendeeFormModalComponent, { maxWidth: '720px', width: '100%', data: { attendanceId: this.attendanceId() } });
    this.dialogRef.set(ref);
  }

  public openImport(): void {
    const ref = this.dialog.open(ImportAttendeesFormModalComponent, { maxWidth: '600px', width: '100%', data: { attendanceId: this.attendanceId() } });
    this.importDialogRef.set(ref);
  }

  public async bulkDeleteAttendees(): Promise<void> {
    const selectedIds = this.attendanceAttendeeStore.selectedAttendeeIds();
    if (!selectedIds.length) return;

    const attendees = this.attendanceAttendeeStore.filteredAttendees().filter((attendee) => selectedIds.includes(attendee.id));
    if (!attendees.length) return;

    const confirmed = await this.confirmationDialogService.confirm({
      title: 'Delete attendees',
      message: `Are you sure you want to delete <strong>${attendees.length}</strong> selected attendee(s)?`,
      positiveButtonText: 'Yes, delete',
      negativeButtonText: 'No, cancel',
    });

    if (!confirmed) return;

    this.dispatcher.dispatch(AttendanceAttendeeEvents.bulkDeleteAttendees({
      attendance_id: this.attendanceId(),
      attendees,
    }));
  }

  #onCreateAttendeeSuccess = rxMethod<GetAttendee>(
    pipe(tap(() => this.dialogRef()?.close()))
  )(this.events.on(AttendanceAttendeeEvents.createAttendeeSuccess).pipe(
    map(({ payload }) => payload)
  ));

  #onImportAttendeesSuccess = rxMethod<{ count: number; message: string }>(
    pipe(tap(() => this.importDialogRef()?.close()))
  )(this.events.on(AttendanceAttendeeEvents.importAttendeesSuccess).pipe(
    map(({ payload }) => payload)
  ));
}