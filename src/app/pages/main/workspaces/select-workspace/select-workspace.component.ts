import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthStore } from '@/app/store/auth/auth.store';
import { AuthService } from '@/app/services/auth.service';
import { AuthEvents } from '@/app/store/auth/auth.events';
import { Dispatcher } from '@ngrx/signals/events';
import { WorkspacesService } from '@/app/services/workspaces.service';

@Component({
  selector: 'app-select-workspace',
  templateUrl: './select-workspace.component.html',
  styleUrl: './select-workspace.component.scss',
  imports: [MatButtonModule, MatCardModule],
})
export class SelectWorkspaceComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly dispatcher = inject(Dispatcher);
  private readonly workspacesService = inject(WorkspacesService);

  public readonly user = computed(() => this.authStore.user());
  public workspaces = signal<any[]>([]);
  public selectedWorkspaceId = signal<string | null>(null);
  public loading = signal(false);

  public async ngOnInit(): Promise<void> {
    const user = await this.authService.getMe();
    this.dispatcher.dispatch(AuthEvents.setUser({ user }));

    if ('workspace_id' in user) {
      this.router.navigate(['/main/home']);
      return;
    }

    const result = await this.workspacesService.getWorkspaces({ page: 1, limit: 100 });
    this.workspaces.set(result.data);
  }

  public selectWorkspace(id: string): void {
    this.selectedWorkspaceId.set(id);
  }

  public async skip(): Promise<void> {
    await this.workspacesService.selectWorkspace('null');
    const user = await this.authService.getMe();
    this.dispatcher.dispatch(AuthEvents.setUser({ user }));
    this.router.navigate(['/main/home']);
  }

  public async confirm(): Promise<void> {
    const id = this.selectedWorkspaceId();
    if (!id) return;
    this.loading.set(true);
    try {
      await this.workspacesService.selectWorkspace(id);
      const user = await this.authService.getMe();
      this.dispatcher.dispatch(AuthEvents.setUser({ user }));
      this.router.navigate(['/main/home']);
    } finally {
      this.loading.set(false);
    }
  }
}