import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import mainRoutes from "./main.routes";
import { HomeComponent } from "./home/home.component";

@NgModule({
  imports: [
    RouterModule.forChild(mainRoutes),
    HomeComponent,
  ],
})
export class MainModule {
}