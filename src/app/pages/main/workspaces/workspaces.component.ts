import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { WorkspaceFormDialogComponent } from "./workspace-form-dialog/workspace-form-dialog.component";
import { WorkspaceCardComponent } from "./workspace-card/workspace-card.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";
import { Dispatcher } from "@ngrx/signals/events";
import { WorkspacesEvents } from "@/app/store/workspaces/workspaces.events";
import { WorkspacesStore } from "@/app/store/workspaces/workspaces.store";
import { MatIconModule } from "@angular/material/icon";
import { EmptySectionComponent } from "@/app/compponents/empty-section/empty-section.component";
import { LoadingSectionComponent } from "@/app/compponents/loading-section/loading-section.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss'],
  imports: [
    MatButtonModule,
    WorkspaceCardComponent,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    EmptySectionComponent,
    LoadingSectionComponent,
    FormsModule,
  ]
})
export class WorkspacesComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly dispatcher = inject(Dispatcher);
  private readonly workspacesStore = inject(WorkspacesStore);

  public workspaceSearchQuery = signal<string>('');

  public workspaces = computed(() => this.workspacesStore.workspaces());

  public loading = computed(() => this.workspacesStore.loading());

  public hasMoreWorkspaces = computed(() => this.workspacesStore.hasMoreWorkspaces());

  public loadingMore = computed(() => this.workspacesStore.loadingMore());

  public ngOnInit(): void {
    this.dispatcher.dispatch(WorkspacesEvents.loadWorkspaces());
  }

  public searchWorkspaces(): void {
    this.dispatcher.dispatch(WorkspacesEvents.searchWorkspaces({ q: this.workspaceSearchQuery() }));
  }

  public clearSearchWorkspaces(): void {
    this.workspaceSearchQuery.set('');
    this.searchWorkspaces();
  }

  public loadMoreWorkspaces(): void {
    this.dispatcher.dispatch(WorkspacesEvents.loadMoreWorkspaces());
  }

  public openAddWorkspace(): void {
    this.dialog.open(WorkspaceFormDialogComponent, {
      maxWidth: '620px',
      width: '100%',
      height: 'auto',
      autoFocus: 'first-tabbable',
    });
  }
}