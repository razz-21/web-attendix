import { TextTransformToReadablePipe } from '@/app/pipes/text-transform-to-readable.pipe';
import { UserDetailsEvents } from '@/app/store/user-details/user-details.events';
import { UserDetailsStore } from '@/app/store/user-details/user-details.store';
import { UserStatusSchema } from '@/app/types/users/users.schema';
import { GetUser, UserStatus } from '@/app/types/users/users.type';
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

export interface UserDetailsStatusModel {
  status: UserStatus;
}

export interface UserDetailsStatusFormResult {
  status: UserStatus;
}

const emptyModel = (): UserDetailsStatusModel => ({
  status: 'needs_verification',
});

@Component({
  selector: 'app-user-details-status-form',
  templateUrl: './user-details-status-form.component.html',
  styleUrl: './user-details-status-form.component.scss',
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
export class UserDetailsStatusFormComponent implements OnInit {
  private readonly userDetailsStore = inject(UserDetailsStore);
  private readonly dispatcher = inject(Dispatcher);
  private readonly events = inject(Events);
  private readonly dialogRef = inject(MatDialogRef<UserDetailsStatusFormComponent, UserDetailsStatusFormResult | undefined>);

  public readonly statuses = UserStatusSchema.options;
  public readonly statusHints: Record<UserStatus, string> = {
    active: 'User can access and use the system normally.',
    inactive: 'User is disabled and cannot access the system.',
    needs_verification: 'User account is pending verification before full access.',
  };

  public readonly currentUser = computed(() => this.userDetailsStore.user());
  public readonly updateLoading = computed(() => this.userDetailsStore.updateLoading());

  public readonly model = signal<UserDetailsStatusModel>({
    ...emptyModel(),
  });

  public readonly selectedStatusHint = computed(() => {
    const status = this.userDetailsStatusForm.status().value();
    if (!status) {
      return 'Select a status for this account.';
    }
    return this.statusHints[status as UserStatus];
  });

  public readonly allStatusHints = computed(() =>
    this.statuses.map((status) => `${status.replaceAll('_', ' ')}: ${this.statusHints[status]}`).join(' | ')
  );

  public ngOnInit(): void {
    if (this.currentUser()) {
      this.model.set({
        status: this.currentUser()?.status ?? 'needs_verification',
      });
    }
  }

  public readonly userDetailsStatusForm = form(this.model, (root) => {
    required(root.status);
    validate(root.status, ({ value }) =>
      value().trim().length > 0
        ? undefined
        : { kind: 'required', message: 'Status is required' }
    );
  }, {
    submission: {
      action: async () => {
        this.dispatcher.dispatch(UserDetailsEvents.updateUserDetails({ payload: { status: this.model().status } }));
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
        status: this.userDetailsStatusForm.status().value(),
      },
      {
        status: currentUser.status,
      }
    );
  });

  #onSuccessUpdateStatus = rxMethod<GetUser>(
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