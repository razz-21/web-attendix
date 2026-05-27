import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { ElementRef } from "@angular/core";
import { Component, computed, inject, OnInit, signal, viewChild } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogActions, MatDialogRef } from "@angular/material/dialog";
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatChipGrid, MatChipInput, MatChipRemove, MatChipRow } from "@angular/material/chips";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { Dispatcher, Events } from "@ngrx/signals/events";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, tap, map } from "rxjs";
import { AuthStore } from "@/app/store/auth/auth.store";
import { AttendanceDetailsStore } from "@/app/store/attendance-details/attendance-details.store";
import { AttendanceDetailsEvents } from "@/app/store/attendance-details/attendance-details.events";
import { AttendancesEvents } from "@/app/store/attendances/attendances.events";
import { AvatarComponent } from "@/app/compponents/avatar/avatar.component";
import { WorkspacesService } from "@/app/services/workspaces.service";
import { GetUser } from "@/app/types/users/users.type";
import { GetAttendance } from "@/app/types/attendaces/attendances.types";

export interface ShareWithOthersModalData {
  attendance: GetAttendance;
}

type SharedWithUser = Pick<GetUser, "id" | "firstname" | "lastname">;

@Component({
  selector: 'app-share-with-others-modal',
  templateUrl: './share-with-others-modal.component.html',
  styleUrl: './share-with-others-modal.component.scss',
  imports: [
    MatAutocompleteModule,
    MatChipGrid,
    MatChipInput,
    MatChipRemove,
    MatChipRow,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    AvatarComponent,
  ],
})
export class ShareWithOthersModalComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<ShareWithOthersModalComponent>);
  private readonly dialogData = inject<ShareWithOthersModalData>(MAT_DIALOG_DATA);

  private readonly dispatcher = inject(Dispatcher);
  private readonly events = inject(Events);

  private readonly authStore = inject(AuthStore);
  private readonly workspacesService = inject(WorkspacesService);
  private readonly attendanceDetailsStore = inject(AttendanceDetailsStore);

  private readonly userInput = viewChild<ElementRef<HTMLInputElement>>("userInput");

  private readonly creatorId = this.getCreatorId(this.dialogData.attendance);

  private readonly initialSharedWithIdsSet = new Set<string>(
    [
      ...(this.dialogData.attendance.shared_with ?? []),
      ...(this.dialogData.attendance.shared_with_users ?? []).map((u) => u.id),
    ].filter((id) => id !== this.creatorId),
  );

  public readonly selectedUsers = signal<SharedWithUser[]>(
    (this.dialogData.attendance.shared_with_users ?? []).filter((u) => u.id !== this.creatorId),
  );

  public readonly workspaceUsers = signal<GetUser[]>([]);

  public readonly searchQuery = signal<string>("");
  public readonly loadingWorkspaceUsers = signal<boolean>(false);

  public readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  public readonly saving = computed(() => this.attendanceDetailsStore.updateLoading());

  public readonly hasChanges = computed(() => {
    const current = new Set(this.selectedUsers().map((u) => u.id));
    if (current.size !== this.initialSharedWithIdsSet.size) return true;
    for (const id of current) {
      if (!this.initialSharedWithIdsSet.has(id)) return true;
    }
    return false;
  });

  public readonly filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const selectedIds = new Set(this.selectedUsers().map((u) => u.id));

    return this.workspaceUsers().filter((u) => {
      if (u.id === this.creatorId) return false;
      if (selectedIds.has(u.id)) return false;
      if (!q) return true;
      const haystack = `${u.firstname} ${u.lastname} ${u.email}`.toLowerCase();
      return haystack.includes(q);
    });
  });

  public readonly showNoUsersFound = computed(
    () => !this.loadingWorkspaceUsers() && this.filteredUsers().length === 0,
  );

  public ngOnInit(): void {
    const workspaceId = this.authStore.user()?.workspace_id;
    if (!workspaceId) return;

    this.loadingWorkspaceUsers.set(true);
    this.workspacesService
      .getWorkspaceUsers(workspaceId)
      .then((users) => {
        this.workspaceUsers.set(users);

        // If backend didn't provide `shared_with_users`, hydrate selection from `shared_with` ids.
        if (this.selectedUsers().length === 0 && this.initialSharedWithIdsSet.size > 0) {
          const workspaceUsersById = new Map(users.map((u) => [u.id, u] as const));
          const hydrated = [...this.initialSharedWithIdsSet]
            .map((id) => workspaceUsersById.get(id))
            .filter((u): u is GetUser => !!u && u.id !== this.creatorId);
          this.selectedUsers.set(hydrated);
          return;
        }

        // Ensure selection stays within the workspace list and excludes the creator.
        const allowedIds = new Set(users.map((u) => u.id));
        this.selectedUsers.update((prev) =>
          prev.filter((u) => allowedIds.has(u.id) && u.id !== this.creatorId),
        );
      })
      .finally(() => this.loadingWorkspaceUsers.set(false));
  }

  public onSearchInput(value: string): void {
    this.searchQuery.set(value);
  }

  public userSelected(event: MatAutocompleteSelectedEvent): void {
    const user = event.option.value as GetUser;
    if (user.id === this.creatorId) return;
    if (this.selectedUsers().some((u) => u.id === user.id)) return;

    this.selectedUsers.update((users) => [...users, user]);
    this.searchQuery.set("");

    const el = this.userInput()?.nativeElement;
    if (el) el.value = "";
  }

  public removeUser(user: SharedWithUser): void {
    this.selectedUsers.update((users) => users.filter((u) => u.id !== user.id));
  }

  public closeDialog(): void {
    this.dialogRef.close();
  }

  public onSave(): void {
    if (!this.hasChanges()) return;

    const attendanceId = this.dialogData.attendance.id;
    const shared_with = this.selectedUsers().map((u) => u.id);

    this.dispatcher.dispatch(
      AttendanceDetailsEvents.updateAttendanceDetails({
        id: attendanceId,
        payload: { shared_with },
      }),
    );
  }

  #onUpdateSuccess = rxMethod<void>(
    pipe(
      tap(() => {
        this.dispatcher.dispatch(AttendancesEvents.loadAttendances());
        this.dialogRef.close(true);
      }),
    ),
  )(this.events.on(AttendanceDetailsEvents.updateAttendanceDetailsSuccess).pipe(map(() => void 0)));

  private getCreatorId(attendance: GetAttendance): string | null {
    const createdBy = attendance.created_by as string | { id?: string };
    if (typeof createdBy === "string") return createdBy;
    if (createdBy && typeof createdBy === "object" && createdBy.id) return createdBy.id;
    return null;
  }
}