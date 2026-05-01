import { environment } from "@/environments/environment";
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { GetPaginatedWorkspace, GetPaginatedWorkspaceParams, GetWorkspace, PatchWorkspace, PostWorkspace, Workspace } from "../types/workspaces/workspaces.types";
import { lastValueFrom } from "rxjs";
import { GetUser, User } from "../types/users/users.type";

@Injectable({
  providedIn: 'root',
})
export class WorkspacesService {
  private readonly http = inject(HttpClient);
  private readonly workspacesApi = `${environment.apiBaseUrl}/api/v1/workspaces`;

  public async getWorkspaces(params: GetPaginatedWorkspaceParams): Promise<GetPaginatedWorkspace> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.q) queryParams.set('q', params.q);

    return lastValueFrom(
      this.http.get<GetPaginatedWorkspace>(`${this.workspacesApi}?${queryParams.toString()}`)
    )
  }

  public async getWorkspaceById(id: string): Promise<GetWorkspace> {
    return lastValueFrom(
      this.http.get<GetWorkspace>(`${this.workspacesApi}/${id}`)
    )
  }

  public async createWorkspace(workspace: PostWorkspace): Promise<GetWorkspace> {
    return lastValueFrom(
      this.http.post<GetWorkspace>(`${this.workspacesApi}`, workspace)
    )
  }

  public async patchWorkspace(id: string, payload: PatchWorkspace): Promise<GetWorkspace> {
    return lastValueFrom(
      this.http.patch<GetWorkspace>(`${this.workspacesApi}/${id}`, payload)
    )
  }

  public async deleteWorkspace(id: string): Promise<void> {
    return lastValueFrom(
      this.http.delete<void>(`${this.workspacesApi}/${id}`)
    )
  }

  public async getWorkspaceUsers(id: string): Promise<GetUser[]> {
    return lastValueFrom(
      this.http.get<GetUser[]>(`${this.workspacesApi}/${id}/users`)
    )
  }
}