import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ResetPasswordFormComponent } from './reset-password-form/reset-password-form.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ResetPasswordFormComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent {}
