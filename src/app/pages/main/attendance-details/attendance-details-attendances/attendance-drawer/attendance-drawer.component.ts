import { Component, inject, computed } from '@angular/core';
import { AttendanceStore } from '@/app/store/attendance/attendance.store';
import { Dispatcher } from '@ngrx/signals/events';
import { AttendanceEvents } from '@/app/store/attendance/attendance.events';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { AvatarComponent } from '@/app/compponents/avatar/avatar.component';

@Component({
  selector: 'app-attendance-drawer',
  templateUrl: './attendance-drawer.component.html',
  styleUrl: './attendance-drawer.component.scss',
  imports: [MatButtonModule, MatIconModule, MatListModule, MatButtonToggleModule, AvatarComponent],
})
export class AttendanceDrawerComponent {
  private readonly dispatcher = inject(Dispatcher);
  private readonly attendanceStore = inject(AttendanceStore);

  public readonly drawerOpen = computed(() => this.attendanceStore.drawerOpen());

  public readonly selectedAttendance = computed(() => this.attendanceStore.selectedAttendance());

  public closeDrawer(): void {
    this.dispatcher.dispatch(AttendanceEvents.selectAttendance({ attendance: null }));
  }
}