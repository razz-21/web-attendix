import { NgModule } from "@angular/core";
import { attendanceDetailsRoutes } from "./attendance-details.routes";
import { RouterModule } from "@angular/router";

@NgModule({
  imports: [
    RouterModule.forChild(attendanceDetailsRoutes),
  ],
  exports: [],
})
export class AttendanceDetailsModule { }