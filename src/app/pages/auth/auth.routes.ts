import { LoginComponent } from "./login/login.component";
import { Routes } from "@angular/router";

const authRoutes: Routes = [
  {
    path: '',
    component: LoginComponent
  }
];

export default authRoutes;