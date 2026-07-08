import { UserDetailsEvents } from '@/app/store/user-details/user-details.events';
import { UserDetailsStore } from '@/app/store/user-details/user-details.store';
import { GetUser } from '@/app/types/users/users.type';
import { isObjectsTheSame } from '@/app/utils/is-objects-the-same';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormField, FormRoot, form, required, validate } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Dispatcher, Events } from '@ngrx/signals/events';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { map, pipe, tap } from 'rxjs';

export interface UserDetailsRfidModel {
  rfid: string;
}

export interface UserDetailsRfidFormResult {
  rfid: string;
}

const emptyModel = (): UserDetailsRfidModel => ({
  rfid: '',
});

@Component({
  selector: 'app-user-details-rfid-form',
  templateUrl: './user-details-rfid-form.component.html',
  styleUrl: './user-details-rfid-form.component.scss',
  imports: [
    FormRoot,
    FormField,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsRfidFormComponent implements OnInit {
  private readonly userDetailsStore = inject(UserDetailsStore);
  private readonly dispatcher = inject(Dispatcher);
  private readonly events = inject(Events);
  private readonly dialogRef = inject(MatDialogRef<UserDetailsRfidFormComponent, UserDetailsRfidFormResult | undefined>);

  public readonly currentUser = computed(() => this.userDetailsStore.user());
  public readonly updateLoading = computed(() => this.userDetailsStore.updateLoading());

  public readonly model = signal<UserDetailsRfidModel>({
    ...emptyModel(),
  });

  public ngOnInit(): void {
    if (this.currentUser()) {
      this.model.set({
        rfid: this.currentUser()?.rfid ?? '',
      });
    }
  }

  public readonly userDetailsRfidForm = form(this.model, (root) => {
    required(root.rfid);
    validate(root.rfid, ({ value }) =>
      value().trim().length > 0
        ? undefined
        : { kind: 'required', message: 'RFID / ID is required' }
    );
  }, {
    submission: {
      action: async () => {
        const rfid = this.model().rfid.trim();
        this.dispatcher.dispatch(UserDetailsEvents.updateUserDetails({ payload: { rfid } }));
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
        rfid: this.userDetailsRfidForm.rfid().value(),
      },
      {
        rfid: currentUser.rfid,
      }
    );
  });

  #onSuccessUpdateRfid = rxMethod<GetUser>(
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
