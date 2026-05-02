import { WorkspaceDetailsEvents } from '@/app/store/workspace-details/workspace-details.events';
import { WorkspaceDetailsStore } from '@/app/store/workspace-details/workspace-details.store';
import { GetUser } from '@/app/types/users/users.type';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipGrid, MatChipInput, MatChipRemove, MatChipRow } from '@angular/material/chips';
import { MatDialogContent, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Dispatcher, Events } from '@ngrx/signals/events';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap } from 'rxjs';

@Component({
  selector: 'app-add-workspace-user',
  templateUrl: './add-workspace-user.component.html',
  styleUrls: ['./add-workspace-user.component.scss'],
  imports: [
    MatAutocompleteModule,
    MatChipGrid,
    MatChipInput,
    MatChipRemove,
    MatChipRow,
    MatDialogContent,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDialogActions,
    MatButtonModule
],
})
export class AddWorkspaceUserComponent implements OnInit {
  private readonly dispatcher = inject(Dispatcher);
  private readonly events = inject(Events);
  private readonly workspaceDetailsStore = inject(WorkspaceDetailsStore);
  private readonly dialogRef = inject(MatDialogRef<AddWorkspaceUserComponent>);
  
  private readonly userInput = viewChild<ElementRef<HTMLInputElement>>('userInput');

  public readonly selectedUsers = signal<GetUser[]>([]);

  public readonly searchQuery = signal('');

  public readonly searchedUsers = computed(() => this.workspaceDetailsStore.searchedUsers());

  public readonly searchedUsersWithoutWorkspaceUsers = computed(() => this.searchedUsers().data.filter((user) => !user.workspace_id));

  public readonly emptySearchedUsers = computed(() => this.searchedUsersWithoutWorkspaceUsers().length === 0);

  protected readonly showNoUsersFound = computed(
    () => !this.searchUsersLoading() && this.filteredUsers().length === 0,
  );

  public noSelectedUsers = computed(() => this.selectedUsers().length === 0);

  public readonly searchUsersLoading = computed(() => this.workspaceDetailsStore.searchUsersLoading());

  public readonly addWorkspaceUsersLoading = computed(() => this.workspaceDetailsStore.addWorkspaceUsersLoading());
  
  public readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  public readonly filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const selectedIds = new Set(this.selectedUsers().map((u) => u.id));
    return this.searchedUsersWithoutWorkspaceUsers().filter((u) => {
      if (selectedIds.has(u.id)) {
        return false;
      }
      if (!q) {
        return true;
      }
      const haystack = `${u.firstname} ${u.lastname} ${u.email}`.toLowerCase();
      return haystack.includes(q);
    });
  });

  public ngOnInit(): void {
    this.dispatcher.dispatch(WorkspaceDetailsEvents.searchUsers({ q: '' }));
  }

  public onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.dispatcher.dispatch(WorkspaceDetailsEvents.searchUsers({ q: value }));
  }

  public userSelected(event: MatAutocompleteSelectedEvent): void {
    const user = event.option.value as GetUser;
    this.selectedUsers.update((users) => [...users, user]);
    this.searchQuery.set('');
    const el = this.userInput()?.nativeElement;
    if (el) {
      el.value = '';
    }
  }

  public removeUser(user: GetUser): void {
    this.selectedUsers.update((users) => users.filter((u) => u.id !== user.id));
  }

  public addWorkspaceUsers(): void {
    this.dispatcher.dispatch(WorkspaceDetailsEvents.addWorkspaceUsers({ users: this.selectedUsers() }));
  }

  #checkAddUserWorkspaceSuccess = rxMethod(
    pipe(
      tap(() => {
        this.dialogRef.close();
      }),
    ),
  )(this.events.on(WorkspaceDetailsEvents.addWorkspaceUsersSuccess));

  public cancel(): void {
    this.dialogRef.close();
  }
}
