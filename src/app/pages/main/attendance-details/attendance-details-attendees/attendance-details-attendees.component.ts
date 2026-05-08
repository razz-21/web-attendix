import { Component, inject, computed } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDialog } from "@angular/material/dialog";
import { AttendeeTableComponent } from './attendee-table/attendee-table.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-attendance-details-attendees',
  templateUrl: './attendance-details-attendees.component.html',
  styleUrls: ['./attendance-details-attendees.component.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    AttendeeTableComponent,
  ]
})
export class AttendanceDetailsAttendeesComponent {
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);

  // Get attendanceId from parent route params
  public readonly attendanceId = computed(() => {
    return this.route.parent?.snapshot.paramMap.get('id') ?? '';
  });

  public openCreate(): void {
    (async () => {
      const module = await import('@/app/pages/main/attendance-details/attendance-details-attendees/attendee-form-modal/attendee-form-modal.component');
      this.dialog.open(module.AttendeeFormModalComponent, { maxWidth: '720px', width: '100%', data: { attendanceId: this.attendanceId() } });
    })();
  }
}