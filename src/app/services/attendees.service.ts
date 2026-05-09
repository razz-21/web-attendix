import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@/environments/environment";
import { lastValueFrom } from "rxjs";
import { GetAttendee, GetPaginatedAttendees, GetAttendeesQuery, PatchAttendee, PostAttendee } from "@/app/types/attendaces/attendees.types";

@Injectable({ providedIn: 'root' })
export class AttendeesService {
  private readonly http = inject(HttpClient);
  private readonly attendeesApi = `${environment.apiBaseUrl}/api/v1/attendees`;

  public getAttendeesByAttendance(attendanceId: string, params?: GetAttendeesQuery): Promise<GetPaginatedAttendees> {
    const qp = new URLSearchParams();
    if (params?.q) qp.set('q', params.q);
    if (params?.page) qp.set('page', String(params.page));
    if (params?.limit) qp.set('limit', String(params.limit));

    return lastValueFrom(
      this.http.get<GetPaginatedAttendees>(`${environment.apiBaseUrl}/api/v1/attendances/${attendanceId}/attendees?${qp.toString()}`)
    );
  }

  public getAttendeeById(attendanceId: string, attendeeId: string): Promise<GetAttendee> {
    return lastValueFrom(this.http.get<GetAttendee>(`${environment.apiBaseUrl}/api/v1/attendances/${attendanceId}/attendees/${attendeeId}`));
  }

  public createAttendee(attendanceId: string, payload: PostAttendee): Promise<GetAttendee> {
    return lastValueFrom(this.http.post<GetAttendee>(`${environment.apiBaseUrl}/api/v1/attendances/${attendanceId}/attendees`, payload));
  }

  public updateAttendee(attendanceId: string, attendeeId: string, payload: Partial<PatchAttendee>): Promise<GetAttendee> {
    return lastValueFrom(this.http.patch<GetAttendee>(`${environment.apiBaseUrl}/api/v1/attendances/${attendanceId}/attendees/${attendeeId}`, payload));
  }

  public deleteAttendee(attendanceId: string, attendeeId: string): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${environment.apiBaseUrl}/api/v1/attendances/${attendanceId}/attendees/${attendeeId}`));
  }

  public async existRfid(attendanceId: string, rfid: string): Promise<boolean> {
    return lastValueFrom(this.http.post<boolean>(`${environment.apiBaseUrl}/api/v1/attendances/${attendanceId}/attendees/exist-rfid`, { rfid }));
  }
}
