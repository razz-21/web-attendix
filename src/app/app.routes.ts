import { Routes } from '@angular/router';
import { MainGuard } from './guards/main.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule)
  },
  { 
    path: '',
    canActivate: [MainGuard],
    loadChildren: () => import('./pages/main/main.module').then(m => m.MainModule)
  }
];
