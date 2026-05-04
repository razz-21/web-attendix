import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-attendance-details-attendances',
  templateUrl: './attendance-details-attendances.component.html',
  styleUrls: ['./attendance-details-attendances.component.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
  ]
})
export class AttendanceDetailsAttendancesComponent {
}