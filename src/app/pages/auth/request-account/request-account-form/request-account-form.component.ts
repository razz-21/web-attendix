import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormField, FormRoot, email, form, required, validate } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { DEPARTMENTS } from '@/app/constants/departments.constant';
import { AUTH_LOGIN_PATH, AUTH_REQUEST_ACCOUNT_SUCCESS_PATH } from '@/app/constants/route.constant';
import { Router } from '@angular/router';
import { AuthEvents } from '@/app/store/auth/auth.events';
import { Dispatcher, Events } from '@ngrx/signals/events';
import { GetUser } from '@/app/types/users/users.type';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, map } from 'rxjs';
import { AuthStore } from '@/app/store/auth/auth.store';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface RequestAccountModel {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  username: string;
  password: string;
  confirmPassword: string;
}

const emptyModel = (): RequestAccountModel => ({
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  department: '',
  username: '',
  password: '',
  confirmPassword: '',
});

@Component({
  selector: 'app-request-account-form',
  imports: [FormRoot, FormField, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './request-account-form.component.html',
  styleUrl: './request-account-form.component.scss',
})
export class RequestAccountFormComponent {
  private readonly router = inject(Router);
  private readonly dispatcher = inject(Dispatcher);
  private readonly events = inject(Events);
  private readonly authStore = inject(AuthStore);
  
  public readonly departments = DEPARTMENTS;
  public readonly model = signal<RequestAccountModel>(emptyModel());

  public readonly passwordHidden = signal(true);
  public readonly confirmPasswordHidden = signal(true);

  public readonly requestAccountLoading = computed(() => this.authStore.requestAccountLoading());

  public readonly requestForm = form(this.model, (root) => {
    required(root.id);
    required(root.firstName);
    required(root.lastName);
    required(root.department);
    required(root.email);
    email(root.email);
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
        const payload = {
          id: crypto.randomUUID(),
          rfid: this.requestForm.id().value(),
          firstname: this.requestForm.firstName().value(),
          lastname: this.requestForm.lastName().value(),
          email: this.requestForm.email().value(),
          department: this.requestForm.department().value(),
          username: this.requestForm.username().value(),
          password: this.requestForm.password().value(),
        }
        this.dispatcher.dispatch(AuthEvents.requestAccount({ payload }));
        return undefined;
      },
    },
  });

  public navigateToLogin(): void {
    this.router.navigate([AUTH_LOGIN_PATH]);
  }

  #onRequestAccountSuccess = rxMethod<GetUser>(
    pipe(
      tap(() => {
        this.router.navigate([AUTH_REQUEST_ACCOUNT_SUCCESS_PATH]);
      })
    )
  )(this.events.on(AuthEvents.requestAccountSuccess).pipe(map(({ payload }) => payload.user)));
}
