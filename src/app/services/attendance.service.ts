import { environment } from "@/environments/environment";
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { GetAttendance, PatchAttendance, PostAttendance } from "../types/attendance/attendance.types";
import { lastValueFrom } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private readonly http = inject(HttpClient);
  private readonly attendancesApi = `${environment.apiBaseUrl}/api/v1/attendances`;

  public async getAttendance(attendance_id: string, q?: string): Promise<GetAttendance[]> {
    return lastValueFrom(
      this.http.get<GetAttendance[]>(
        `${this.attendancesApi}/${attendance_id}/attendance${q ? `?q=${q}` : ''}`
      )
    );
  }

  public async getAttendanceById(attendance_id: string, id: string): Promise<GetAttendance> {
    return lastValueFrom(
      this.http.get<GetAttendance>(`${this.attendancesApi}/${attendance_id}/attendance/${id}`)
    );
  }

  public async createAttendance(attendance_id: string, payload: PostAttendance): Promise<GetAttendance> {
    return lastValueFrom(
      this.http.post<GetAttendance>(`${this.attendancesApi}/${attendance_id}/attendance`, payload)
    );
  }

  public async updateAttendance(attendance_id: string, id: string, payload: PatchAttendance): Promise<GetAttendance> {
    return lastValueFrom(
      this.http.patch<GetAttendance>(`${this.attendancesApi}/${attendance_id}/attendance/${id}`, payload)
    );
  }

  public async deleteAttendance(attendance_id: string, id: string): Promise<void> {
    return lastValueFrom(
      this.http.delete<void>(`${this.attendancesApi}/${attendance_id}/attendance/${id}`)
    );
  }
}