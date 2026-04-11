import { Component, computed, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { disabled, form, FormField, FormRoot, required, validate } from "@angular/forms/signals";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { AuthStore } from "@/app/store/auth/auth.store";
import { Dispatcher, Events } from "@ngrx/signals/events";
import { UserStatus } from "@/app/types/users/users.type";
import { UserStatusSchema } from "@/app/types/users/users.schema";
import { MatSelectModule } from "@angular/material/select";
import { TextTransformToReadablePipe } from "@/app/pipes/text-transform-to-readable.pipe";
import { AuthEvents } from "@/app/store/auth/auth.events";
import { PatchPassword } from "@/app/types/auth/auth.types";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { map, pipe, tap } from "rxjs";

interface PasswordModel {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

@Component({
  selector: 'app-manage-account-section',
  templateUrl: './manage-account-section.component.html',
  styleUrl: './manage-account-section.component.scss',
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    FormField,
    FormRoot,
    TextTransformToReadablePipe
  ]
})
export class ManageAccountSectionComponent {
  private readonly authStore = inject(AuthStore);
  private readonly dispatcher = inject(Dispatcher);
  private readonly events = inject(Events);

  private readonly emptyPasswordModel = (): PasswordModel => ({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  public passwordModel = signal<PasswordModel>(this.emptyPasswordModel());

  public readonly currentPasswordHidden = signal(true);
  public readonly newPasswordHidden = signal(true);
  public readonly confirmNewPasswordHidden = signal(true);

  public passwordForm = form(this.passwordModel, (root) => {
    required(root.currentPassword);
    required(root.newPassword);
    required(root.confirmNewPassword);
    validate(root.confirmNewPassword, (ctx) => {
      const confirmNewPassword = ctx.value();
      const newPassword = ctx.valueOf(root.newPassword);
      if (!confirmNewPassword) {
        return undefined;
      }
      return confirmNewPassword === newPassword ? undefined : { kind: 'passwordMismatch', message: 'Passwords must match' };
    });
  }, {
    submission: {
      action: async () => {
        const payload: PatchPassword = {
          current_password: this.passwordModel().currentPassword,
          new_password: this.passwordModel().newPassword,
          confirm_new_password: this.passwordModel().confirmNewPassword,
        };
        this.dispatcher.dispatch(AuthEvents.updatePassword({ payload }));
        return undefined;
      },
    },
  });

  public updatePasswordLoading = computed(() => this.authStore.updatePasswordLoading());

  public passwordDisabledForm = computed(() => this.updatePasswordLoading() || this.passwordForm().invalid());

  #onSuccessUpdatePassword = rxMethod<boolean>(
    pipe(
      tap(() => {
        this.passwordModel.set(this.emptyPasswordModel());
        this.passwordForm().reset();
        this.currentPasswordHidden.set(true);
        this.newPasswordHidden.set(true);
        this.confirmNewPasswordHidden.set(true);
      })
    )
  )(this.events.on(AuthEvents.updatePasswordSuccess).pipe(map(({ payload }) => payload.success)));
  
  public statusModel = signal<{ status: UserStatus }>({
    status: 'active',
  });

  public readonly statuses = UserStatusSchema.options;

  public statusForm = form(this.statusModel, (root) => {
    required(root.status);
    disabled(root.status);
    validate(root.status, (ctx) => {
      const status = ctx.value();
      if (!status) {
        return undefined;
      }
    });
  });

}