import { Component, computed, input, inject, output } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoadingSectionComponent } from "@/app/compponents/loading-section/loading-section.component";
import { AttendanceStatus } from '@/app/types/attendaces/attendances.types';
import { MAIN_ATTENDANCE_DETAILS_PATH } from '@/app/constants/route.constant';
import { Router } from '@angular/router';
import { AuthStore } from '@/app/store/auth/auth.store';

export interface Attendance {
  id: string;
  name: string;
  code: string;
  status: AttendanceStatus;
  scheduleDays: string[];
  description: string;
  lateThreshold: number;
  createdAt: string;
  createdBy: string;
}

@Component({
  selector: 'app-attendance-table',
  templateUrl: './attendance-table.component.html',
  styleUrl: './attendance-table.component.scss',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    DatePipe,
    LoadingSectionComponent,
    TitleCasePipe
  ],
})
export class AttendanceTableComponent {
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);

  public readonly attendances = input<Attendance[]>([]);
  public readonly loading = input<boolean>(false);

  public readonly attendanceArchived = output<string>();
  public readonly attendanceSetAsActive = output<string>();

  public readonly hasAttendances = computed(() => this.attendances().length > 0);
  public readonly currentUser = computed(() => this.authStore.user());

  public canManage(attendance: Attendance): boolean {
    const user = this.currentUser();
    if (!user) return false;
    return attendance.createdBy === user.id;
  }

  public onEditAttendance(attendance: Attendance): void {
    if (attendance.status === 'archived') {
      return;
    }

    console.log('Edit attendance:', attendance);
    // TODO: Handle edit action
  }

  public onArchiveAttendance(attendance: Attendance): void {
    if (attendance.status === 'archived') {
      return;
    }

    this.attendanceArchived.emit(attendance.id);
  }

  public onSetAttendanceAsActive(attendance: Attendance): void {
    if (attendance.status === 'active') {
      return;
    }

    this.attendanceSetAsActive.emit(attendance.id);
  }

  public onAttendanceClick(attendance: Attendance): void {
    const path = MAIN_ATTENDANCE_DETAILS_PATH.replace(':id', attendance.id);
    this.router.navigate([path]);
  }
}
