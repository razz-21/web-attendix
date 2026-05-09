import { MAIN_ATTENDANCES_PATH } from "@/app/constants/route.constant";
import { TitleCasePipe } from "@angular/common";
import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AttendancesStore } from "@/app/store/attendances/attendances.store";
import { ConfirmationDialogService } from "@/app/services/confirmation-dialog.service";
import { MatDialog } from "@angular/material/dialog";
import { Dispatcher } from "@ngrx/signals/events";
import { computed } from "@angular/core";
import { AttendanceFormModalComponent } from "../attendances/attendance-form-modal/attendance-form-modal.component";
import { AttendancesEvents } from "@/app/store/attendances/attendances.events";
import { SCHEDULE_DAY_MAP } from "@/app/constants/schedule-days.constant";
import { AttendanceScheduleDays } from "@/app/types/attendaces/attendances.types";

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
    RouterOutlet
  ]
})
export class AttendanceDetailsComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly attendancesStore = inject(AttendancesStore);
  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  private readonly dialog = inject(MatDialog);
  private readonly dispatcher = inject(Dispatcher);

  private readonly attendanceId = computed(() => this.route.snapshot.paramMap.get('id'));
  
  public readonly attendance = computed(() => {
    const id = this.attendanceId();
    if (!id) return null;
    return this.attendancesStore.attendancesMap()[id] ?? null;
  });

  public readonly tabs = [
    { label: "attendances", route: "attendances" },
    { label: "attendees", route: "attendees" },
    { label: "records", route: "records" },
    { label: "analysis", route: "analysis" },
    { label: "configurations", route: "configurations" }
  ] as const;

  public navigateBack(): void {
    this.router.navigate([MAIN_ATTENDANCES_PATH]);
  }

  public openEditAttendance(): void {
    const attendance = this.attendance();
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
        this.dispatcher.dispatch(AttendancesEvents.updateAttendance({ id: attendance.id, data: payload }));
      }
    });
  }

  public async deleteAttendance(): Promise<void> {
    const attendance = this.attendance();
    if (!attendance) return;

    const confirmed = await this.confirmationDialogService.confirm({
      title: 'Delete Attendance',
      message: `Are you sure you want to delete <strong>${attendance.name}</strong>? This action cannot be undone.`,
      positiveButtonText: 'Delete',
      negativeButtonText: 'Cancel'
    });

    if (confirmed) {
      this.dispatcher.dispatch(AttendancesEvents.deleteAttendance(attendance));
      this.navigateBack();
    }
  }
}