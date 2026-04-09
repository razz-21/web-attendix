import { environment } from "@/environments/environment";
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { GetPaginatedUsers, GetUser, PatchUser, User } from "../types/users/users.type";
import { lastValueFrom } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly usersApi = `${environment.apiBaseUrl}/api/v1/users`;

  public async getPaginatedUsers(page: number, limit: number, q?: string, status?: string, role?: string): Promise<GetPaginatedUsers> {
    return lastValueFrom(
      this.http.get<GetPaginatedUsers>(`${this.usersApi}?page=${page}&limit=${limit}${q ? `&q=${q}` : ''}${status ? `&status=${status}` : ''}${role ? `&role=${role}` : ''}`)
    )
  }

  public async getUserById(id: string): Promise<User> {
    return lastValueFrom(
      this.http.get<User>(`${this.usersApi}/${id}`)
      )
  }

  public async createUser(user: User): Promise<GetUser> {
    return lastValueFrom(
      this.http.post<User>(`${this.usersApi}`, user)
    )
  }

  public async updateUser(id: string, payload: PatchUser): Promise<GetUser> {
    return lastValueFrom(
      this.http.patch<GetUser>(`${this.usersApi}/${id}`, payload)
    )
  }

  public async deleteUser(id: string): Promise<void> {
    return lastValueFrom(
      this.http.delete<void>(`${this.usersApi}/${id}`)
    )
  }

  public async existUsername(username: string): Promise<boolean> {
    return lastValueFrom(
      this.http.post<boolean>(`${this.usersApi}/exist-username`, { username })
    )
  }
}