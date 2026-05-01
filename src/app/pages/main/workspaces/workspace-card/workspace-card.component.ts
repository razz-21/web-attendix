import { GetWorkspace, Workspace } from "@/app/types/workspaces/workspaces.types";
import { Component, input } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";

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
  public readonly workspace = input.required<GetWorkspace>();
}