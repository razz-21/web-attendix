import { Routes } from '@angular/router';
import { MainGuard } from './guards/main.guard';
import { SelectWorkspaceComponent } from './pages/main/workspaces/select-workspace/select-workspace.component';
import { AboutComponent } from './pages/main/about/about.component';

export const routes: Routes = [
  { 
    path: '',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule)
  },
  { 
    path: '',
    canActivate: [MainGuard],
    loadChildren: () => import('./pages/main/main.module').then(m => m.MainModule)
  },
  {
    path: 'select-workspace',
    component: SelectWorkspaceComponent,
  },
  {
    path: 'about',
    component: AboutComponent,
  }
];
