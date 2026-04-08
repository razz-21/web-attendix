import { environment } from "@/environments/environment";
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { GetPaginatedUsers, GetUser, User } from "../types/users/users.type";
import { lastValueFrom } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly usersApi = `${environment.apiBaseUrl}/api/v1/users`;

  public async getPaginatedUsers(page: number, limit: number): Promise<GetPaginatedUsers> {
    return lastValueFrom(
      this.http.get<GetPaginatedUsers>(`${this.usersApi}?page=${page}&limit=${limit}`)
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

  public async updateUser(id: string, user: User): Promise<GetUser> {
    return lastValueFrom(
      this.http.put<GetUser>(`${this.usersApi}/${id}`, user)
    )
  }

  public async deleteUser(id: string): Promise<void> {
    return lastValueFrom(
      this.http.delete<void>(`${this.usersApi}/${id}`)
    )
  }
}