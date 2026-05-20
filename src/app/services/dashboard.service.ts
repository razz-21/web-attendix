import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@/environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  getDashboard() {
    return firstValueFrom(
      this.http.get(`${environment.apiBaseUrl}/api/v1/dashboard/home`)
    );
  }

  searchAttendances(q: string) {
    return firstValueFrom(
      this.http.get(`${environment.apiBaseUrl}/api/v1/dashboard/attendances/search`, {
        params: { q },
      })
    );
  }
}