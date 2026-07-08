import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '@/environments/environment';
import { GetAttendanceRecord } from '@/app/types/attendance-record/attendance-record.types';

export interface MarkPublicAttendanceParams {
  attendances_id: string;
  attendance_id: string;
  rfid: string;
  otc: string;
}

@Injectable({
  providedIn: 'root',
})
export class PublicAttendanceService {
  private readonly http = inject(HttpClient);
  private readonly publicAttendanceApi =
    `${environment.apiBaseUrl}/api/v1/attendances/:attendances_id/public-attendance-record`;

  public markAttendance(params: MarkPublicAttendanceParams): Promise<GetAttendanceRecord> {
    const url = this.publicAttendanceApi.replace(':attendances_id', params.attendances_id);
    return lastValueFrom(
      this.http.post<GetAttendanceRecord>(url, null, {
        params: {
          attendance_id: params.attendance_id,
          rfid: params.rfid,
          otc: params.otc,
        },
      }),
    );
  }
}
