import { environment } from "@/environments/environment";
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { GetPaginatedGroupMembers, GetPaginatedGroupMemberParams, GetGroupMember, PatchGroupMember, PostGroupMember } from "../types/group-members/group-members.type";
import { lastValueFrom } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class GroupMembersService {
  private readonly http = inject(HttpClient);
  private readonly groupsApi = `${environment.apiBaseUrl}/api/v1/groups`;

  public async getPaginatedGroupMembers(group_id: string, params: GetPaginatedGroupMemberParams): Promise<GetPaginatedGroupMembers> {
    const { page = 1, limit = 10, q, department } = params;
    return lastValueFrom(
      this.http.get<GetPaginatedGroupMembers>(
        `${this.groupsApi}/${group_id}/members?page=${page}&limit=${limit}${q ? `&q=${q}` : ''}${department ? `&department=${department}` : ''}`
      )
    );
  }

  public async getGroupMemberById(group_id: string, id: string): Promise<GetGroupMember> {
    return lastValueFrom(
      this.http.get<GetGroupMember>(`${this.groupsApi}/${group_id}/members/${id}`)
    );
  }

  public async createGroupMember(group_id: string, member: PostGroupMember): Promise<GetGroupMember> {
    return lastValueFrom(
      this.http.post<GetGroupMember>(`${this.groupsApi}/${group_id}/members`, member)
    );
  }

  public async updateGroupMember(group_id: string, id: string, payload: PatchGroupMember): Promise<GetGroupMember> {
    return lastValueFrom(
      this.http.put<GetGroupMember>(`${this.groupsApi}/${group_id}/members/${id}`, payload)
    );
  }
  
  public async importGroupMembers(group_id: string, members: PostGroupMember[]): Promise<GetGroupMember[]> {
    return lastValueFrom(
      this.http.post<GetGroupMember[]>(`${this.groupsApi}/${group_id}/members/import`, members)
    );
  }

  public async deleteGroupMember(group_id: string, id: string): Promise<void> {
    return lastValueFrom(
      this.http.delete<void>(`${this.groupsApi}/${group_id}/members/${id}`)
    );
  }

  public async bulkDeleteGroupMembers(group_id: string, ids: string[]): Promise<void> {
    return lastValueFrom(
      this.http.post<void>(`${this.groupsApi}/${group_id}/members/bulk-delete`, { ids })
    );
  }
  
}