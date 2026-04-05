import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, required, validate } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { DEPARTMENTS } from '@/app/constants/departments.constant';
import { AUTH_LOGIN_PATH } from '@/app/constants/route.constant';
import { Router } from '@angular/router';

export interface RequestAccountModel {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  username: string;
  password: string;
  confirmPassword: string;
}

const emptyModel = (): RequestAccountModel => ({
  id: '',
  firstName: '',
  lastName: '',
  department: '',
  username: '',
  password: '',
  confirmPassword: '',
});

@Component({
  selector: 'app-request-account-form',
  imports: [FormRoot, FormField, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './request-account-form.component.html',
  styleUrl: './request-account-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestAccountFormComponent {
  private readonly router = inject(Router);

  public readonly departments = DEPARTMENTS;
  public readonly model = signal<RequestAccountModel>(emptyModel());

  public readonly passwordHidden = signal(true);
  public readonly confirmPasswordHidden = signal(true);

  public readonly requestForm = form(this.model, (root) => {
    required(root.id);
    required(root.firstName);
    required(root.lastName);
    required(root.department);
    required(root.username);
    required(root.password);
    required(root.confirmPassword);
    validate(root.confirmPassword, (ctx) => {
      const confirm = ctx.value();
      const pwd = ctx.valueOf(root.password);
      if (!confirm) {
        return undefined;
      }
      return confirm === pwd
        ? undefined
        : { kind: 'passwordMismatch', message: 'Passwords must match' };
    });
  }, {
    submission: {
      action: async () => {
        // Wire to API when available
        return undefined;
      },
    },
  });

  public navigateToLogin(): void {
    this.router.navigate([AUTH_LOGIN_PATH]);
  }
}
