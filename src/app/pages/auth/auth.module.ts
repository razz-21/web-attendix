import { NgModule } from '@angular/core';
import authRoutes from './auth.routes';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild(authRoutes)
  ],
})
export class AuthModule {
}