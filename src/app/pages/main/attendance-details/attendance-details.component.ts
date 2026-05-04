import { MAIN_ATTENDANCES_PATH } from "@/app/constants/route.constant";
import { TitleCasePipe } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { Router } from "@angular/router";

@Component({
  selector: 'app-attendance-details',
  templateUrl: './attendance-details.component.html',
  styleUrls: ['./attendance-details.component.scss'],
  imports: [
    TitleCasePipe,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ]
})
export class AttendanceDetailsComponent {
  private readonly router = inject(Router);

  public readonly tabs = [
    "attendances",
    "attendees",
    "records",
    "analysis",
    "configurations"
  ] as const;
  
  public readonly activeTab = signal<(typeof this.tabs)[number]>("attendances");

  public navigateBack(): void {
    this.router.navigate([MAIN_ATTENDANCES_PATH]);
  }

  public onTabClick(tab: (typeof this.tabs)[number]): void {
    this.activeTab.set(tab);
  }
}