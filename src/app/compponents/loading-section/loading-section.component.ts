import { Component, input } from "@angular/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
  selector: "app-loading-section",
  templateUrl: "./loading-section.component.html",
  styleUrls: ["./loading-section.component.scss"],
  imports: [MatProgressSpinnerModule],
})
export class LoadingSectionComponent {
  public readonly label = input<string>("Loading...");
}
