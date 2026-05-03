import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@/environments/environment';
import { lastValueFrom } from 'rxjs';
import { GetAttendance, GetPaginatedAttendances, PatchAttendance, PostAttendance } from '../types/attendaces/attendances.types';

@Injectable({
  providedIn: 'root'
})
export class AttendancesService {
  private readonly http = inject(HttpClient);
  private readonly attendancesApi = `${environment.apiBaseUrl}/api/v1/attendances`;

  public getAttendances(): Promise<GetAttendance[]> {
    return lastValueFrom(
      this.http.get<GetAttendance[]>(
        `${this.attendancesApi}`
      )
    );
  }

  public getAttendanceById(id: string): Promise<GetAttendance> {
    return lastValueFrom(
      this.http.get<GetAttendance>(
        `${this.attendancesApi}/${id}`
      )
    );
  }

  public createAttendance(payload: PostAttendance): Promise<GetAttendance> {
    return lastValueFrom(
      this.http.post<GetAttendance>(
        `${this.attendancesApi}`,
        payload
      )
    );
  }

  public updateAttendance(id: string, payload: Partial<PatchAttendance>): Promise<GetAttendance> {
    return lastValueFrom(
      this.http.patch<GetAttendance>(
        `${this.attendancesApi}/${id}`,
        payload
      )
    );
  }

  public deleteAttendance(id: string): Promise<boolean> {
    return lastValueFrom(
      this.http.delete<boolean>(
        `${this.attendancesApi}/${id}`
      )
    );
  }
}
