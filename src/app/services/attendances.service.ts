import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@/environments/environment';
import { lastValueFrom, shareReplay } from 'rxjs';
import { GetAttendance, GetAttendancesQuery, GetPaginatedAttendances, PatchAttendance, PostAttendance } from '../types/attendaces/attendances.types';

@Injectable({
  providedIn: 'root'
})
export class AttendancesService {
  private readonly http = inject(HttpClient);
  private readonly attendancesApi = `${environment.apiBaseUrl}/api/v1/attendances`;
  private attendancesCache = new Map<string, Promise<GetAttendance[]>>();

  public getAttendances(params: GetAttendancesQuery): Promise<GetAttendance[]> {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.set('q', params.q);
    if (params.status) queryParams.set('status', params.status);
    
    return lastValueFrom(
      this.http.get<GetAttendance[]>(
        `${this.attendancesApi}?${queryParams.toString()}`
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

  public clearCache(): void {
    this.attendancesCache.clear();
  }

  public clearCacheByKey(q?: string, status?: string): void {
    const queryParams = new URLSearchParams();
    if (q) queryParams.set('q', q);
    if (status) queryParams.set('status', status);
    const cacheKey = queryParams.toString();
    this.attendancesCache.delete(cacheKey);
  }
}
