import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@/environments/environment';
import { lastValueFrom } from 'rxjs';

export interface BackendAttendance {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: 'Active' | 'Archived';
  schedule_days: string[];
  late_threshold: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAttendancePayload {
  id?: string;
  name: string;
  code: string;
  description?: string;
  status: 'Active' | 'Archived';
  schedule_days: string[];
  late_threshold: number;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface GetAttendancesResponse {
  data: BackendAttendance[];
  page?: number;
  limit?: number;
  total?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AttendancesService {
  private readonly http = inject(HttpClient);

  public getAttendances(): Promise<GetAttendancesResponse> {
    return lastValueFrom(
      this.http.get<GetAttendancesResponse>(
        `${environment.apiBaseUrl}/api/v1/attendances`
      )
    );
  }

  public getAttendanceById(id: string): Promise<BackendAttendance> {
    return lastValueFrom(
      this.http.get<BackendAttendance>(
        `${environment.apiBaseUrl}/api/v1/attendances/${id}`
      )
    );
  }

  public createAttendance(payload: CreateAttendancePayload): Promise<BackendAttendance> {
    return lastValueFrom(
      this.http.post<BackendAttendance>(
        `${environment.apiBaseUrl}/api/v1/attendances`,
        payload
      )
    );
  }

  public updateAttendance(id: string, payload: Partial<CreateAttendancePayload>): Promise<BackendAttendance> {
    return lastValueFrom(
      this.http.patch<BackendAttendance>(
        `${environment.apiBaseUrl}/api/v1/attendances/${id}`,
        payload
      )
    );
  }

  public deleteAttendance(id: string): Promise<{ success: boolean }> {
    return lastValueFrom(
      this.http.delete<{ success: boolean }>(
        `${environment.apiBaseUrl}/api/v1/attendances/${id}`
      )
    );
  }
}
