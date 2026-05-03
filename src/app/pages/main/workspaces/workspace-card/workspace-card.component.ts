import { MAIN_WORKSPACE_DETAILS_PATH } from "@/app/constants/route.constant";
import { GetWorkspace } from "@/app/types/workspaces/workspaces.types";
import { Component, inject, input } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { Router } from "@angular/router";

@Component({
  selector: 'app-workspace-card',
  templateUrl: './workspace-card.component.html',
  styleUrls: ['./workspace-card.component.scss'],
  imports: [
    MatCardModule,
    MatIconModule,
    MatTooltipModule
  ]
})
export class WorkspaceCardComponent {
  private readonly router = inject(Router);
  public readonly workspace = input.required<GetWorkspace>();

  public navigateToWorkspaceDetails(): void {
    this.router.navigate([MAIN_WORKSPACE_DETAILS_PATH.replace(':id', this.workspace().id)]);
  }
}