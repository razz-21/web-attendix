import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { AttendanceTableComponent, Attendance } from './attendance-table/attendance-table.component';
import { AttendanceFormModalComponent } from './attendance-form-modal/attendance-form-modal.component';
import { AttendanceFormModel } from './attendance-form/attendance-form.component';
import { Dispatcher } from '@ngrx/signals/events';
import { AttendancesStore } from '@/app/store/attendances/attendances.store';
import { AttendancesEvents } from '@/app/store/attendances/attendances.events';
import { AuthService } from '@/app/services/auth.service';
import { CreateAttendancePayload } from '@/app/services/attendances.service';


const SCHEDULE_DAY_MAP: Record<string, string> = {
  'Monday': 'Mon',
  'Tuesday': 'Tue',
  'Wednesday': 'Wed',
  'Thursday': 'Thu',
  'Friday': 'Fri',
  'Saturday': 'Sat',
  'Sunday': 'Sun',
};

@Component({
  selector: 'app-attendances',
  templateUrl: './attendaces.component.html',
  styleUrl: './attendaces.component.scss',
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, AttendanceTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendancesComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly dispatcher = inject(Dispatcher);
  private readonly authService = inject(AuthService);
  private readonly attendancesStore = inject(AttendancesStore);

  public readonly attendances = computed(() =>
    this.attendancesStore.attendances().map(attendance => ({
      id: attendance.id,
      name: attendance.name,
      code: attendance.code,
      status: attendance.status,
      scheduleDays: this.backendDaysToFrontendDays(attendance.schedule_days),
      description: attendance.description ?? '',
      lateThreshold: attendance.late_threshold,
      createdAt: attendance.created_at,
    }))
  );

  public readonly searchQuery = signal('');

  public readonly filteredAttendances = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.attendances();
    return this.attendances().filter(a => {
      return (
        a.name.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q)
      );
    });
  });

  private currentUserId: string | null = null;

  public ngOnInit(): void {
    this.loadUserAndAttendances();
  }

  private async loadUserAndAttendances(): Promise<void> {
    try {
      const user = await this.authService.getMe();
      this.currentUserId = user.id;
      // Load attendances from store
      this.dispatcher.dispatch(AttendancesEvents.loadAttendances());
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  }

  public openAddAttendance(): void {
    const dialogRef = this.dialog.open(AttendanceFormModalComponent, {
      maxWidth: '620px',
      width: '100%',
      height: 'auto',
      autoFocus: 'first-tabbable',
    });

    dialogRef.afterClosed().subscribe((data: AttendanceFormModel | undefined) => {
      if (data && this.currentUserId) {
        this.submitAttendance(data);
      }
    });
  }

  private submitAttendance(formData: AttendanceFormModel): void {
    if (!this.currentUserId) {
      console.error('User ID not available');
      return;
    }

    const backendPayload: CreateAttendancePayload = {
      id: crypto.randomUUID(),
      name: formData.name,
      code: formData.code,
      status: formData.status,
      schedule_days: formData.scheduleDays.map(day => SCHEDULE_DAY_MAP[day]),
      description: formData.description,
      late_threshold: formData.lateThreshold,
      created_by: this.currentUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.dispatcher.dispatch(AttendancesEvents.createAttendance(backendPayload));
  }

  private backendDaysToFrontendDays(days: string[]): string[] {
    const dayMap: Record<string, string> = {
      'Mon': 'Monday',
      'Tue': 'Tuesday',
      'Wed': 'Wednesday',
      'Thu': 'Thursday',
      'Fri': 'Friday',
      'Sat': 'Saturday',
      'Sun': 'Sunday',
    };
    return days.map(day => dayMap[day] || day);
  }
}