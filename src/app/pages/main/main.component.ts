import { MainSidebarComponent } from "@/app/compponents/main-sidebar/main-sidebar.component";
import { UsersEvents } from "@/app/store/users/users.events";
import { Component, inject, OnDestroy } from "@angular/core";
import { MatSidenavModule } from "@angular/material/sidenav";
import { RouterOutlet } from "@angular/router";
import { Dispatcher } from "@ngrx/signals/events";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  imports: [MatSidenavModule, MainSidebarComponent, RouterOutlet]
})
export class MainComponent implements OnDestroy {
  private readonly dispatcher = inject(Dispatcher);
  
  public ngOnDestroy(): void {
    this.dispatcher.dispatch(UsersEvents.resetStore());
  }
}