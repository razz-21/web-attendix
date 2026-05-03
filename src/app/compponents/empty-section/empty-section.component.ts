import { Component, input } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-empty-section",
  templateUrl: "./empty-section.component.html",
  styleUrls: ["./empty-section.component.scss"],
  imports: [MatCardModule, MatIconModule],
})
export class EmptySectionComponent {
  public readonly title = input.required<string>();
  public readonly message = input.required<string>();
}
