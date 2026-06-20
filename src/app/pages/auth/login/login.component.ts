import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LoginFormComponent } from './login-form/login-form.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LoginFormComponent, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {}
