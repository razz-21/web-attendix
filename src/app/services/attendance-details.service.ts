import { GetAttendance, PatchAttendance } from "../types/attendaces/attendances.types";
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@/environments/environment";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class AttendanceDetailsService {
  private readonly http = inject(HttpClient);
  private readonly attendanceDetailsApi = `${environment.apiBaseUrl}/api/v1/attendances`;

  public getAttendanceDetails(id: string): Observable<GetAttendance> {
    return this.http.get<GetAttendance>(`${this.attendanceDetailsApi}/${id}`);
  }

  public updateAttendanceDetails(id: string, payload: PatchAttendance): Observable<GetAttendance> {
    return this.http.patch<GetAttendance>(`${this.attendanceDetailsApi}/${id}`, payload);
  }

  public deleteAttendanceDetails(id: string): Observable<void> {
    return this.http.delete<void>(`${this.attendanceDetailsApi}/${id}`);
  }
}