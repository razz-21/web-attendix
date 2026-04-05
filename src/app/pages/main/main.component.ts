import { MainSidebarComponent } from "@/app/compponents/main-sidebar/main-sidebar.component";
import { Component } from "@angular/core";
import { MatSidenavModule } from "@angular/material/sidenav";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  imports: [MatSidenavModule, MainSidebarComponent, RouterOutlet]
})
export class MainComponent {}