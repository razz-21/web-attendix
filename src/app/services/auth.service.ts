import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@/environments/environment';
import { lastValueFrom } from 'rxjs';
import { EmailLogin, EmailLoginResponse, PatchPassword, PatchProfile } from '../types/auth/auth.types';
import { GetUser } from '../types/users/users.type';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);

  public emailLogin(payload: EmailLogin): Promise<EmailLoginResponse> {
    return lastValueFrom(this.http.post<EmailLoginResponse>(`${environment.apiBaseUrl}/api/v1/auth/email-login`, payload));
  }

  public logout(): Promise<boolean> {
    return lastValueFrom(this.http.delete<boolean>(`${environment.apiBaseUrl}/api/v1/auth/logout`, {}));
  }

  public async getMe(): Promise<GetUser> {
    return lastValueFrom(this.http.get<GetUser>(`${environment.apiBaseUrl}/api/v1/me`));
  }

  public async updateProfile(id: string, payload: PatchProfile): Promise<GetUser> {
    return lastValueFrom(this.http.patch<GetUser>(`${environment.apiBaseUrl}/api/v1/users/${id}`, payload));
  }

  public async updatePassword(id: string, payload: PatchPassword): Promise<{ success: boolean, messsage: string }> {
    return lastValueFrom(this.http.patch<{ success: boolean, messsage: string }>(`${environment.apiBaseUrl}/api/v1/me/password`, payload));
  }
}