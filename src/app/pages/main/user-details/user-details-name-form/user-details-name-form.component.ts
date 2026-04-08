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

export interface UserDetailsNameModel {
  firstname: string;
  lastname: string;
}

export interface UserDetailsNameFormData {
  firstname?: string;
  lastname?: string;
}

export interface UserDetailsNameFormResult {
  firstname: string;
  lastname: string;
}

const emptyModel = (): UserDetailsNameModel => ({
  firstname: '',
  lastname: '',
});

@Component({
  selector: 'app-user-details-name-form',
  templateUrl: './user-details-name-form.component.html',
  styleUrl: './user-details-name-form.component.scss',
  imports: [
    FormRoot,
    FormField,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsNameFormComponent implements OnInit {
  private readonly userDetailsStore = inject(UserDetailsStore);
  private readonly dispatcher = inject(Dispatcher);
  private readonly events = inject(Events);
  private readonly dialogRef = inject(MatDialogRef<UserDetailsNameFormComponent, UserDetailsNameFormResult | undefined>);
  
  public readonly currentUser = computed(() => this.userDetailsStore.user());
  public readonly updateLoading = computed(() => this.userDetailsStore.updateLoading());

  public readonly model = signal<UserDetailsNameModel>({
    ...emptyModel(),
  });

  public ngOnInit(): void {
    if (this.currentUser()) {
      this.model.set({
        firstname: this.currentUser()?.firstname ?? '',
        lastname: this.currentUser()?.lastname ?? '',
      });
    }
  }

  public readonly userDetailsNameForm = form(this.model, (root) => {
    required(root.firstname);
    required(root.lastname);
    validate(root.firstname, ({ value }) =>
      value().trim().length > 0
        ? undefined
        : { kind: 'required', message: 'First name is required' }
    );
    validate(root.lastname, ({ value }) =>
      value().trim().length > 0
        ? undefined
        : { kind: 'required', message: 'Last name is required' }
    );
  }, {
    submission: {
      action: async () => {
        const firstname = this.model().firstname.trim();
        const lastname = this.model().lastname.trim();
        this.dispatcher.dispatch(UserDetailsEvents.updateUserDetails({ payload: { firstname, lastname } }));
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
        firstname: this.userDetailsNameForm.firstname().value(),
        lastname: this.userDetailsNameForm.lastname().value(),
      },
      {
        firstname: currentUser.firstname,
        lastname: currentUser.lastname,
      }
    );
  });

  #onSuccessUpdateName = rxMethod<GetUser>(
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