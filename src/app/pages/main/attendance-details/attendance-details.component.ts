import { MAIN_ATTENDANCES_PATH } from "@/app/constants/route.constant";
import { TitleCasePipe } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { ConfirmationDialogService } from "@/app/services/confirmation-dialog.service";
import { MatDialog } from "@angular/material/dialog";
import { Dispatcher, Events } from "@ngrx/signals/events";
import { computed } from "@angular/core";
import { AttendanceFormModalComponent } from "../attendances/attendance-form-modal/attendance-form-modal.component";
import { SCHEDULE_DAY_MAP } from "@/app/constants/schedule-days.constant";
import { AttendanceScheduleDays } from "@/app/types/attendaces/attendances.types";
import { AttendanceDetailsStore } from "@/app/store/attendance-details/attendance-details.store";
import { AttendanceDetailsEvents } from "@/app/store/attendance-details/attendance-details.events";
import { LoadingSectionComponent } from "@/app/compponents/loading-section/loading-section.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, tap, map } from "rxjs";
import { AttendanceAttendeeEvents } from "@/app/store/attendance-attendee/attendance-attendee.events";
import { AttendanceEvents } from "@/app/store/attendance/attendance.events";
import { AttendanceAttendeeStore } from "@/app/store/attendance-attendee/attendance-attendee.store";
import { AttendanceStore } from "@/app/store/attendance/attendance.store";

@Component({
  selector: 'app-attendance-details',
  templateUrl: './attendance-details.component.html',
  styleUrls: ['./attendance-details.component.scss'],
  imports: [
    TitleCasePipe,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    LoadingSectionComponent
  ]
})
export class AttendanceDetailsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly dispatcher = inject(Dispatcher);
  private readonly snackBar = inject(MatSnackBar);
  private readonly events = inject(Events);
  private readonly attendanceDetailsStore = inject(AttendanceDetailsStore);
  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  private readonly attendanceAttendeeStore = inject(AttendanceAttendeeStore); // Inject to reflect the attendance attendees state
  private readonly attendanceStore = inject(AttendanceStore); // Inject to reflect the attendance state

  private attendanceId = computed(() => this.route.snapshot.paramMap.get('id'));
  
  public attendanceDetails = computed(() => this.attendanceDetailsStore.attendanceDetails());

  public loading = computed(() => this.attendanceDetailsStore.loading());

  public readonly tabs = [
    { label: "attendances", route: "attendances" },
    { label: "attendees", route: "attendees" },
    { label: "records", route: "records" },
    { label: "analysis", route: "analysis" },
    { label: "configurations", route: "configurations" }
  ] as const;

  public ngOnInit(): void {
    const id = this.attendanceId();
    if (id) {
      this.dispatcher.dispatch(AttendanceDetailsEvents.loadAttendanceDetails({ id }));
      this.dispatcher.dispatch(AttendanceEvents.loadAttendance({ attendance_id: id }));
      this.dispatcher.dispatch(AttendanceAttendeeEvents.loadAttendees({ attendance_id: id }));
    }
  }

  public navigateBack(): void {
    this.router.navigate([MAIN_ATTENDANCES_PATH]);
  }

  public copyCode(): void {
    const attendance = this.attendanceDetails();
    if (!attendance) return;

    navigator.clipboard.writeText(attendance.code);
    this.snackBar.open('Code copied to clipboard', 'Close', { duration: 5000 });
  }

  public openEditAttendance(): void {
    const attendance = this.attendanceDetails();
    if (!attendance) return;

    // Convert backend schedule days to frontend representation
    const frontendDays = attendance.schedule_days.map(d => {
      const entry = Object.entries(SCHEDULE_DAY_MAP).find(([, value]) => value === d);
      return entry ? entry[0] : d;
    });

    const initialData = {
      name: attendance.name,
      code: attendance.code,
      description: attendance.description ?? '',
      status: attendance.status,
      lateThreshold: attendance.late_threshold,
      scheduleDays: frontendDays,
    };

    const dialogRef = this.dialog.open(AttendanceFormModalComponent, {
      maxWidth: '620px',
      width: '100%',
      height: 'auto',
      autoFocus: 'first-tabbable',
      data: { initialData }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        const payload = {
          name: data.name,
          description: data.description,
          late_threshold: data.lateThreshold,
          schedule_days: data.scheduleDays.map((day: string) => SCHEDULE_DAY_MAP[day] as AttendanceScheduleDays[number]),
        };
        this.dispatcher.dispatch(AttendanceDetailsEvents.updateAttendanceDetails({ id: attendance.id, payload }));
      }
    });
  }

  public async deleteAttendance(): Promise<void> {
    const attendance = this.attendanceDetails();
    if (!attendance) return;

    const confirmed = await this.confirmationDialogService.confirm({
      title: 'Delete Attendance',
      message: `Are you sure you want to delete <strong>${attendance.name}</strong>? This action cannot be undone.`,
      positiveButtonText: 'Delete',
      negativeButtonText: 'Cancel'
    });

    if (confirmed) {
      this.dispatcher.dispatch(AttendanceDetailsEvents.deleteAttendanceDetails({ id: attendance.id }));
    }
  }

  #onDeleteAttedanceDetailsSuccess = rxMethod<void>(
    pipe(
      tap(() => {
        this.navigateBack();
      })
    )
  )(this.events.on(AttendanceDetailsEvents.deleteAttendanceDetailsSuccess).pipe(map(() => void 0)));
}