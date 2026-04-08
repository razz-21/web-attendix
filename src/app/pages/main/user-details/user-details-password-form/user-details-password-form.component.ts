import { UserDetailsEvents } from '@/app/store/user-details/user-details.events';
import { UserDetailsStore } from '@/app/store/user-details/user-details.store';
import { GetUser } from '@/app/types/users/users.type';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, required, validate } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Dispatcher, Events } from '@ngrx/signals/events';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { map, pipe, tap } from 'rxjs';

export interface UserDetailsPasswordModel {
  newPassword: string;
  confirmPassword: string;
}

export interface UserDetailsPasswordFormResult {
  password: string;
}

const emptyModel = (): UserDetailsPasswordModel => ({
  newPassword: '',
  confirmPassword: '',
});

@Component({
  selector: 'app-user-details-password-form',
  templateUrl: './user-details-password-form.component.html',
  styleUrl: './user-details-password-form.component.scss',
  imports: [
    FormRoot,
    FormField,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsPasswordFormComponent {
  private readonly userDetailsStore = inject(UserDetailsStore);
  private readonly dispatcher = inject(Dispatcher);
  private readonly events = inject(Events);
  private readonly dialogRef = inject(MatDialogRef<UserDetailsPasswordFormComponent, UserDetailsPasswordFormResult | undefined>);

  public readonly updateLoading = computed(() => this.userDetailsStore.updateLoading());
  public readonly newPasswordHidden = signal(true);
  public readonly confirmPasswordHidden = signal(true);

  public readonly model = signal<UserDetailsPasswordModel>({
    ...emptyModel(),
  });

  public readonly userDetailsPasswordForm = form(this.model, (root) => {
    required(root.newPassword);
    required(root.confirmPassword);
    validate(root.confirmPassword, (ctx) => {
      const confirm = ctx.value();
      const pwd = ctx.valueOf(root.newPassword);
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
        this.dispatcher.dispatch(UserDetailsEvents.updateUserDetails({ payload: { password: this.model().newPassword } }));
        return undefined;
      },
    },
  });

  #onSuccessUpdatePassword = rxMethod<GetUser>(
    pipe(
      tap(() => {
        this.dialogRef.close(undefined);
      })
    )
  )(this.events.on(UserDetailsEvents.updateUserDetailsSuccess).pipe(map(({ payload }) => payload.user)));

  public cancel(): void {
    this.dialogRef.close(undefined);
  }
}