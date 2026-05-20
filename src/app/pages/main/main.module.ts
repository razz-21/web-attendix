import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import mainRoutes from "./main.routes";

@NgModule({
  imports: [
    RouterModule.forChild(mainRoutes)
  ],
})
export class MainModule {
}