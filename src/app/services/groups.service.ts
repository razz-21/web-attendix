import { environment } from "@/environments/environment";
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { GetPaginatedGroups, GetGroup, PatchGroup, PostGroup } from "../types/groups/groups.type";
import { lastValueFrom } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class GroupsService {
  private readonly http = inject(HttpClient);
  private readonly groupsApi = `${environment.apiBaseUrl}/api/v1/groups`;

  public async getPaginatedGroups(page: number, limit: number, q?: string, workspace_id?: string): Promise<GetPaginatedGroups> {
    return lastValueFrom(
      this.http.get<GetPaginatedGroups>(`${this.groupsApi}?page=${page}&limit=${limit}${q ? `&q=${q}` : ''}${workspace_id ? `&workspace_id=${workspace_id}` : ''}`)
    );
  }

  public async getGroupById(id: string): Promise<GetGroup> {
    return lastValueFrom(
      this.http.get<GetGroup>(`${this.groupsApi}/${id}`)
    );
  }

  public async createGroup(group: PostGroup): Promise<GetGroup> {
    return lastValueFrom(
      this.http.post<GetGroup>(`${this.groupsApi}`, group)
    );
  }

  public async updateGroup(id: string, payload: PatchGroup): Promise<GetGroup> {
    return lastValueFrom(
      this.http.patch<GetGroup>(`${this.groupsApi}/${id}`, payload)
    );
  }

  public async deleteGroup(id: string): Promise<void> {
    return lastValueFrom(
      this.http.delete<void>(`${this.groupsApi}/${id}`)
    );
  }

  public async importGroups(groups: PostGroup[]): Promise<{ message: string }> {
    return lastValueFrom(
      this.http.post<{ message: string }>(`${this.groupsApi}/import`, groups)
    );
  }
}