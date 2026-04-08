import { UserDetailsEvents } from '@/app/store/user-details/user-details.events';
import { UserDetailsStore } from '@/app/store/user-details/user-details.store';
import { TextTransformToReadablePipe } from '@/app/pipes/text-transform-to-readable.pipe';
import { GetUser, UserRole } from '@/app/types/users/users.type';
import { UserRoleSchema } from '@/app/types/users/users.schema';
import { isObjectsTheSame } from '@/app/utils/is-objects-the-same';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormField, FormRoot, form, required, validate } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Dispatcher, Events } from '@ngrx/signals/events';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { map, pipe, tap } from 'rxjs';

export interface UserDetailsRoleModel {
  role: UserRole;
}

export interface UserDetailsRoleFormResult {
  role: UserRole;
}

const emptyModel = (): UserDetailsRoleModel => ({
  role: 'user',
});

@Component({
  selector: 'app-user-details-role-form',
  templateUrl: './user-details-role-form.component.html',
  styleUrl: './user-details-role-form.component.scss',
  imports: [
    FormRoot,
    FormField,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TextTransformToReadablePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsRoleFormComponent implements OnInit {
  private readonly userDetailsStore = inject(UserDetailsStore);
  private readonly dispatcher = inject(Dispatcher);
  private readonly events = inject(Events);
  private readonly dialogRef = inject(MatDialogRef<UserDetailsRoleFormComponent, UserDetailsRoleFormResult | undefined>);

  public readonly roles = UserRoleSchema.options;
  public readonly currentUser = computed(() => this.userDetailsStore.user());
  public readonly updateLoading = computed(() => this.userDetailsStore.updateLoading());

  public readonly rolesDescription = signal<Record<UserRole, string>>({
    admin: '<strong>Admin</strong> role with full access to the system and can manage all users',
    user: '<strong>User</strong> role with limited access to the system that can only use the attendance feature of the system',
  });

  public readonly roleDescription = computed(() => this.rolesDescription()[this.userDetailsRoleForm.role().value()]);

  public readonly model = signal<UserDetailsRoleModel>({
    ...emptyModel(),
  });

  public readonly userDetailsRoleForm = form(this.model, (root) => {
    required(root.role);
    validate(root.role, ({ value }) =>
      value().trim().length > 0
        ? undefined
        : { kind: 'required', message: 'Role is required' }
    );
  }, {
    submission: {
      action: async () => {
        this.dispatcher.dispatch(UserDetailsEvents.updateUserDetails({ payload: { role: this.model().role } }));
        return undefined;
      },
    },
  });

  public readonly isValueIsTheSameWithCurrentValue = computed(() => {
    const currentUser = this.currentUser();
    if (!currentUser) {
      return false;
    }

    return isObjectsTheSame(
      {
        role: this.userDetailsRoleForm.role().value(),
      },
      {
        role: currentUser.role,
      }
    );
  });

  #onSuccessUpdateRole = rxMethod<GetUser>(
    pipe(
      tap(() => {
        this.dialogRef.close(undefined);
      })
    )
  )(this.events.on(UserDetailsEvents.updateUserDetailsSuccess).pipe(map(({ payload }) => payload.user)));

  public ngOnInit(): void {
    if (this.currentUser()) {
      this.model.set({
        role: this.currentUser()?.role ?? 'user',
      });
    }
  }

  public cancel(): void {
    this.dialogRef.close(undefined);
  }
}