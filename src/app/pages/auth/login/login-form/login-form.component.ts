import { AUTH_REQUEST_ACCOUNT_PATH, MAIN_BASE_PATH, MAIN_DASHBOARD_PATH } from '@/app/constants/route.constant';
import { AuthEvents } from '@/app/store/auth/auth.events';
import { AuthStore } from '@/app/store/auth/auth.store';
import { EmailLoginResponse } from '@/app/types/auth/auth.types';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Dispatcher, Events } from '@ngrx/signals/events';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { map, pipe, tap } from 'rxjs';

@Component({
  selector: 'app-login-form',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginFormComponent {
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly dispatcher = inject(Dispatcher);
  private readonly events = inject(Events);

  public readonly loggingLoading = computed(() => this.authStore.loggingLoading());
  public readonly loginError = computed(() => this.authStore.loginError());

  public readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
    }),
    password: new FormControl('', {
      nonNullable: true,
    }),
  });

  public navigateToRequestAccount(): void {
    this.router.navigate([AUTH_REQUEST_ACCOUNT_PATH]);
  }

  public navigateToDashboard(): void {
    this.router.navigate([MAIN_BASE_PATH]);
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    
    this.dispatcher.dispatch(AuthEvents.emailLogin({ email: this.form.value.email ?? '', password: this.form.value.password ?? '' }));
  }

  #onLoginSuccess = rxMethod<EmailLoginResponse>(
    pipe(
      tap(() => {
        this.navigateToDashboard();
      })
    )
  )(this.events.on(AuthEvents.emailLoginSuccess).pipe(map(({ payload }) => payload)));
}
