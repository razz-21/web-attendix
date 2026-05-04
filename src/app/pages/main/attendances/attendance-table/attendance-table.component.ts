import { Component, computed, input, inject, output } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoadingSectionComponent } from "@/app/compponents/loading-section/loading-section.component";
import { AttendanceStatus } from '@/app/types/attendaces/attendances.types';

export interface Attendance {
  id: string;
  name: string;
  code: string;
  status: AttendanceStatus;
  scheduleDays: string[];
  description: string;
  lateThreshold: number;
  createdAt: string;
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
  public readonly attendances = input<Attendance[]>([]);
  public readonly loading = input<boolean>(false);

  public readonly attendanceArchived = output<string>();
  public readonly attendanceSetAsActive = output<string>();

  public readonly hasAttendances = computed(() => this.attendances().length > 0);

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
}
