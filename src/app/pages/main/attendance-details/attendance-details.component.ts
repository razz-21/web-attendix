import { MAIN_ATTENDANCES_PATH } from "@/app/constants/route.constant";
import { TitleCasePipe } from "@angular/common";
import { Component, computed, inject, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AttendancesStore } from "@/app/store/attendances/attendances.store";
import { MatDialog } from "@angular/material/dialog";
import { AttendanceFormModalComponent } from "../attendances/attendance-form-modal/attendance-form-modal.component";
import { AttendanceFormModel } from "../attendances/attendance-form/attendance-form.component";
import { Dispatcher } from "@ngrx/signals/events";
import { AttendancesEvents } from "@/app/store/attendances/attendances.events";
import { ConfirmationDialogService } from "@/app/services/confirmation-dialog.service";
import { SCHEDULE_DAY_MAP } from "@/app/constants/schedule-days.constant";
import { AttendanceScheduleDays, PostAttendance } from "@/app/types/attendaces/attendances.types";
import { AuthService } from "@/app/services/auth.service";

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
export class AttendanceDetailsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly attendancesStore = inject(AttendancesStore);
  private readonly dialog = inject(MatDialog);
  private readonly dispatcher = inject(Dispatcher);
  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  private readonly authService = inject(AuthService);

  private currentUserId: string | null = null;

  public readonly attendanceId = computed(() => this.route.snapshot.params['id']);
  public readonly attendance = computed(() => this.attendancesStore.attendancesMap()[this.attendanceId()]);
  public readonly loading = computed(() => this.attendancesStore.loading());
  public readonly updateLoading = computed(() => this.attendancesStore.updateLoading());
  public readonly deleteLoading = computed(() => this.attendancesStore.deleteLoading());
  public readonly createLoading = computed(() => this.attendancesStore.createLoading());

  public readonly tabs = [
    { label: "attendances", route: "attendances" },
    { label: "attendees", route: "attendees" },
    { label: "records", route: "records" },
    { label: "analysis", route: "analysis" },
    { label: "configurations", route: "configurations" }
  ] as const;

  public async ngOnInit(): Promise<void> {
    const user = await this.authService.getMe();
    this.currentUserId = user.id;

    if (!this.attendancesStore.hasAttendances()) {
      this.dispatcher.dispatch(AttendancesEvents.loadAttendances());
    }
  }

  public navigateBack(): void {
    this.router.navigate([MAIN_ATTENDANCES_PATH]);
  }

  public onEdit(): void {
    const attendance = this.attendance();
    if (!attendance) return;

    // Create a reverse map for schedule days
    const reverseScheduleDayMap: Record<string, string> = {};
    Object.entries(SCHEDULE_DAY_MAP).forEach(([key, value]) => {
      reverseScheduleDayMap[value] = key;
    });

    const initialData: AttendanceFormModel = {
      name: attendance.name,
      code: attendance.code,
      description: attendance.description ?? '',
      status: attendance.status === 'active' ? 'Active' : 'Archived',
      lateThreshold: attendance.late_threshold,
      scheduleDays: attendance.schedule_days.map(day => reverseScheduleDayMap[day] || day),
    };

    const dialogRef = this.dialog.open(AttendanceFormModalComponent, {
      maxWidth: '620px',
      width: '100%',
      height: 'auto',
      autoFocus: 'first-tabbable',
      data: initialData,
    });

    dialogRef.afterClosed().subscribe((data: AttendanceFormModel | undefined) => {
      if (data) {
        this.updateAttendance(data);
      }
    });
  }

  private updateAttendance(formData: AttendanceFormModel): void {
    const attendance = this.attendance();
    if (!attendance) return;

    const backendPayload = {
      name: formData.name,
      code: formData.code,
      status: formData.status.toLowerCase() as 'active' | 'archived',
      schedule_days: formData.scheduleDays.map(day => SCHEDULE_DAY_MAP[day] as AttendanceScheduleDays[number]),
      description: formData.description,
      late_threshold: formData.lateThreshold,
      updated_at: new Date().toISOString(),
    };

    this.dispatcher.dispatch(AttendancesEvents.updateAttendance({ id: attendance.id, data: backendPayload }));
  }

  public async onDelete(): Promise<void> {
    const attendance = this.attendance();
    if (!attendance) return;

    const confirmed = await this.confirmationDialogService.confirm({
      title: 'Delete Attendance',
      message: `Are you sure you want to delete <strong>${attendance.name}</strong>? This action is permanent and cannot be undone.`,
      positiveButtonText: 'Delete',
      negativeButtonText: 'Cancel',
    });

    if (confirmed) {
      this.dispatcher.dispatch(AttendancesEvents.deleteAttendance(attendance));
      this.navigateBack();
    }
  }

  public onDuplicate(): void {
    const attendance = this.attendance();
    if (!attendance || !this.currentUserId) return;

    const newAttendance: PostAttendance = {
      ...attendance,
      id: crypto.randomUUID(),
      name: `${attendance.name} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: this.currentUserId,
    };

    this.dispatcher.dispatch(AttendancesEvents.createAttendance(newAttendance));
    // Optional: navigate to the new attendance or stay here
  }
}