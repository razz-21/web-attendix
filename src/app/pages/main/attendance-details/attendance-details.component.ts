import { MAIN_ATTENDANCES_PATH } from "@/app/constants/route.constant";
import { TitleCasePipe } from "@angular/common";
import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-attendance-details',
  templateUrl: './attendance-details.component.html',
  styleUrls: ['./attendance-details.component.scss'],
  imports: [
    TitleCasePipe,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ]
})
export class AttendanceDetailsComponent {
  private readonly router = inject(Router);

  public readonly tabs = [
    { label: "attendances", route: "attendances" },
    { label: "attendees", route: "attendees" },
    { label: "records", route: "records" },
    { label: "analysis", route: "analysis" },
    { label: "configurations", route: "configurations" }
  ] as const;

  public navigateBack(): void {
    this.router.navigate([MAIN_ATTENDANCES_PATH]);
  }
}