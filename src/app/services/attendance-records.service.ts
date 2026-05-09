import { environment } from "@/environments/environment";
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { GetAttendanceRecord, PatchAttendanceRecord, PostAttendanceRecord } from "../types/attendance-records/attendance-records.types";
import { lastValueFrom } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class AttendanceRecordsService {
  private readonly http = inject(HttpClient);
  private readonly attendancesApi = `${environment.apiBaseUrl}/api/v1/attendances`;

  public async getAttendanceRecords(attendance_id: string, q?: string): Promise<GetAttendanceRecord[]> {
    return lastValueFrom(
      this.http.get<GetAttendanceRecord[]>(
        `${this.attendancesApi}/${attendance_id}/attendance${q ? `?q=${q}` : ''}`
      )
    );
  }

  public async getAttendanceRecordById(attendance_id: string, id: string): Promise<GetAttendanceRecord> {
    return lastValueFrom(
      this.http.get<GetAttendanceRecord>(`${this.attendancesApi}/${attendance_id}/attendance/${id}`)
    );
  }

  public async createAttendanceRecord(attendance_id: string, payload: PostAttendanceRecord): Promise<GetAttendanceRecord> {
    return lastValueFrom(
      this.http.post<GetAttendanceRecord>(`${this.attendancesApi}/${attendance_id}/attendance`, payload)
    );
  }

  public async updateAttendanceRecord(attendance_id: string, id: string, payload: PatchAttendanceRecord): Promise<GetAttendanceRecord> {
    return lastValueFrom(
      this.http.patch<GetAttendanceRecord>(`${this.attendancesApi}/${attendance_id}/attendance/${id}`, payload)
    );
  }

  public async deleteAttendanceRecord(attendance_id: string, id: string): Promise<void> {
    return lastValueFrom(
      this.http.delete<void>(`${this.attendancesApi}/${attendance_id}/attendance/${id}`)
    );
  }
}