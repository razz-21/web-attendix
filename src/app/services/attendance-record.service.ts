import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { GetAttendanceRecord, PatchAttendanceRecord, PostAttendanceRecord } from "../types/attendance-record/attendance-record.types";
import { environment } from "@/environments/environment";
import { lastValueFrom } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class AttendanceRecordService {
  private readonly http = inject(HttpClient);
  private readonly attendanceRecordsApi = `${environment.apiBaseUrl}/api/v1/attendances/:attendances_id/attendance-record`;

  public async getAttendanceRecords(attendances_id: string): Promise<GetAttendanceRecord[]> {
    const url = this.attendanceRecordsApi.replace(':attendances_id', attendances_id);
    return lastValueFrom(
      this.http.get<GetAttendanceRecord[]>(url)
    );
  }

  public async createAttendanceRecord(attendances_id: string, payload: PostAttendanceRecord): Promise<GetAttendanceRecord> {
    const url = this.attendanceRecordsApi.replace(':attendances_id', attendances_id);
    return lastValueFrom(
      this.http.post<GetAttendanceRecord>(url, payload)
    );
  }

  public async updateAttendanceRecord(attendances_id: string, id: string, payload: PatchAttendanceRecord): Promise<GetAttendanceRecord> {
    const url = `${this.attendanceRecordsApi.replace(':attendances_id', attendances_id)}/${id}`;
    return lastValueFrom(
      this.http.patch<GetAttendanceRecord>(url, payload)
    );
  }
}