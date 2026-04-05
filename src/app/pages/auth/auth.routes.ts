import { LoginComponent } from "./login/login.component";
import { Routes } from "@angular/router";
import { RequestAccountComponent } from "./request-account/request-account.component";
import { RequestAccountSuccessComponent } from "./request-account-success/request-account-success.component";

const authRoutes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'request-account',
    component: RequestAccountComponent
  },
  {
    path: 'request-account/success',
    component: RequestAccountSuccessComponent
  }
];

export default authRoutes;