import { Routes } from "@angular/router";
import { AttendanceDetailsAttendancesComponent } from "./attendance-details-attendances/attendance-details-attendances.component";
import { AttendanceDetailsAnalysisComponent } from "./attendance-details-analysis/attendance-details-analysis.component";
import { AttendanceDetailsAttendeesComponent } from "./attendance-details-attendees/attendance-details-attendees.component";
import { AttendanceDetailsConfigurationsComponent } from "./attendance-details-configurations/attendance-details-configurations.component";
import { AttendanceDetailsRecordsComponent } from "./attendance-details-records/attendance-details-records.component";
import { AttendanceDetailsComponent } from "./attendance-details.component";

export const attendanceDetailsRoutes: Routes = [
  {
    path: '',
    component: AttendanceDetailsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'attendances',
      },
      {
        path: 'attendances',
        component: AttendanceDetailsAttendancesComponent,
      },
      {
        path: 'attendees',
        component: AttendanceDetailsAttendeesComponent,
      },
      {
        path: 'records',
        component: AttendanceDetailsRecordsComponent,
      },
      {
        path: 'analysis',
        component: AttendanceDetailsAnalysisComponent,
      },
      {
        path: 'configurations',
        component: AttendanceDetailsConfigurationsComponent,
      },
    ]
  },
];

export default attendanceDetailsRoutes;