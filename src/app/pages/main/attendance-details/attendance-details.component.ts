import { MAIN_ATTENDANCES_PATH } from "@/app/constants/route.constant";
import { TitleCasePipe } from "@angular/common";
import { Component, DestroyRef, inject, OnDestroy, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatButtonModule } from "@angular/material/button";
import { MatBadgeModule } from "@angular/material/badge";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { ConfirmationDialogService } from "@/app/services/confirmation-dialog.service";
import { MatDialog } from "@angular/material/dialog";
import { Dispatcher, Events } from "@ngrx/signals/events";
import { computed } from "@angular/core";
import { AttendanceFormModalComponent } from "../attendances/attendance-form-modal/attendance-form-modal.component";
import { SCHEDULE_DAY_MAP, sortScheduleDays } from "@/app/constants/schedule-days.constant";
import { AttendanceScheduleDays } from "@/app/types/attendaces/attendances.types";
import { AttendanceDetailsStore } from "@/app/store/attendance-details/attendance-details.store";
import { AttendanceDetailsEvents } from "@/app/store/attendance-details/attendance-details.events";
import { LoadingSectionComponent } from "@/app/compponents/loading-section/loading-section.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, tap, map, distinctUntilChanged, filter } from "rxjs";
import { AttendanceAttendeeEvents } from "@/app/store/attendance-attendee/attendance-attendee.events";
import { AttendanceEvents } from "@/app/store/attendance/attendance.events";
import { AttendanceAttendeeStore } from "@/app/store/attendance-attendee/attendance-attendee.store";
import { AttendanceStore } from "@/app/store/attendance/attendance.store";
import { AttendanceRecordStore } from "@/app/store/attendance-record/attendance-record.store";
import { AttendanceRecordEvents } from "@/app/store/attendance-record/attendance-record.events";
import { AttendanceRecordRealtimeService } from "@/app/services/attendance-record-realtime.service";
import { AuthStore } from "@/app/store/auth/auth.store";
import { ShareWithOthersModalComponent } from "./components/share-with-others-modal/share-with-others-modal.component";
import {
  StackedAvatarGroupComponent,
  StackedAvatarUser,
} from "@/app/components/stacked-avatar-group/stacked-avatar-group.component";

@Component({
  selector: 'app-attendance-details',
  templateUrl: './attendance-details.component.html',
  styleUrls: ['./attendance-details.component.scss'],
  imports: [
    TitleCasePipe,
    MatButtonModule,
    MatBadgeModule,
    MatIconModule,
    MatTooltipModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    LoadingSectionComponent,
    StackedAvatarGroupComponent,
  ]
})
export class AttendanceDetailsComponent implements OnInit, OnDestroy {
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
  private readonly attendanceRecordStore = inject(AttendanceRecordStore); // Inject to reflect the attendance record state
  private readonly authStore = inject(AuthStore); // Inject current user for creator actions
  private readonly realtime = inject(AttendanceRecordRealtimeService); // Live attendance record updates
  private readonly destroyRef = inject(DestroyRef);

  public attendanceDetails = computed(() => this.attendanceDetailsStore.attendanceDetails());

  public sortedScheduleDays = computed(() => {
    const days = this.attendanceDetails()?.schedule_days || [];
    return sortScheduleDays([...days]);
  });

  public loading = computed(() => this.attendanceDetailsStore.loading());

  public isArchived = computed(() => this.attendanceDetails()?.status === 'archived');

  public readonly sharedParticipants = computed((): StackedAvatarUser[] => {
    const attendance = this.attendanceDetails();
    if (!attendance) return [];

    const participants: StackedAvatarUser[] = [];
    const seen = new Set<string>();

    const createdBy = attendance.created_by;
    if (createdBy && typeof createdBy === "object" && "id" in createdBy) {
      const creator = createdBy as { id: string; firstname: string; lastname: string };
      participants.push({
        id: creator.id,
        firstname: creator.firstname,
        lastname: creator.lastname,
      });
      seen.add(creator.id);
    }

    for (const user of attendance.shared_with_users ?? []) {
      if (!seen.has(user.id)) {
        participants.push({
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
        });
        seen.add(user.id);
      }
    }

    return participants;
  });

  public readonly isCreator = computed(() => {
    const userId = this.authStore.user()?.id;
    if (!userId) return false;

    const createdBy = (this.attendanceDetails()?.created_by ?? null) as unknown;
    if (!createdBy) return false;

    if (typeof createdBy === "string") return createdBy === userId;
    if (typeof createdBy === "object" && createdBy && "id" in createdBy) {
      return (createdBy as { id?: string }).id === userId;
    }

    return false;
  });

  public readonly tabs = [
    { label: "attendances", route: "attendances" },
    { label: "attendees", route: "attendees" },
    { label: "records", route: "records" },
    { label: "analysis", route: "analysis" },
    { label: "configurations", route: "configurations" }
  ] as const;

  public ngOnInit(): void {
    // React to the route id rather than a one-time snapshot: Angular reuses this
    // component when navigating between `attendances/:id` pages, so the socket
    // room and loaded data must re-target the new event on every param change.
    this.route.paramMap
      .pipe(
        map((params) => params.get('id')),
        filter((id): id is string => !!id),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((id) => {
        this.dispatcher.dispatch(AttendanceDetailsEvents.loadAttendanceDetails({ id }));
        this.dispatcher.dispatch(AttendanceEvents.loadAttendance({ attendance_id: id }));
        this.dispatcher.dispatch(AttendanceAttendeeEvents.loadAttendees({ attendance_id: id }));
        this.dispatcher.dispatch(AttendanceRecordEvents.loadAttendanceRecords({ attendances_id: id }));
        this.realtime.connect(id);
      });
  }

  public ngOnDestroy(): void {
    this.realtime.disconnect();
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

  public openShareAttendance(): void {
    const attendance = this.attendanceDetails();
    if (!attendance) return;

    this.dialog.open(ShareWithOthersModalComponent, {
      maxWidth: "620px",
      width: "100%",
      height: "auto",
      autoFocus: "first-tabbable",
      data: { attendance },
    });
  }

  public openEditAttendance(): void {
    const attendance = this.attendanceDetails();
    if (!attendance) return;

    // Convert backend schedule days to frontend representation
    const frontendDays = sortScheduleDays(attendance.schedule_days.map(d => {
      const entry = Object.entries(SCHEDULE_DAY_MAP).find(([, value]) => value === d);
      return entry ? entry[0] : d;
    }));

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

  public async archiveAttendance(): Promise<void> {
    const attendance = this.attendanceDetails();
    if (!attendance || attendance.status === 'archived') return;

    const confirmed = await this.confirmationDialogService.confirm({
      title: 'Archive Attendance',
      message: `Are you sure you want to archive <strong>${attendance.name}</strong>? This attendance will move to the archived list and will not be visible to the users.`,
      positiveButtonText: 'Archive',
      negativeButtonText: 'Cancel'
    });

    if (confirmed) {
      this.dispatcher.dispatch(AttendanceDetailsEvents.updateAttendanceDetails({ id: attendance.id, payload: { status: 'archived' } }));
    }
  }

  public async reactivateAttendance(): Promise<void> {
    const attendance = this.attendanceDetails();
    if (!attendance || attendance.status !== 'archived') return;

    const confirmed = await this.confirmationDialogService.confirm({
      title: 'Reactivate Attendance',
      message: `Are you sure you want to reactivate <strong>${attendance.name}</strong>? Users will be able to add records and attendees again.`,
      positiveButtonText: 'Reactivate',
      negativeButtonText: 'Cancel'
    });

    if (confirmed) {
      this.dispatcher.dispatch(AttendanceDetailsEvents.updateAttendanceDetails({ id: attendance.id, payload: { status: 'active' } }));
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