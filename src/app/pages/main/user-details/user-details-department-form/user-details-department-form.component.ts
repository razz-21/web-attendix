import { DEPARTMENTS } from '@/app/constants/departments.constant';
import { UserDetailsEvents } from '@/app/store/user-details/user-details.events';
import { UserDetailsStore } from '@/app/store/user-details/user-details.store';
import { GetUser } from '@/app/types/users/users.type';
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

export interface UserDetailsDepartmentModel {
  department: string;
}

export interface UserDetailsDepartmentFormResult {
  department: string;
}

const emptyModel = (): UserDetailsDepartmentModel => ({
  department: '',
});

@Component({
  selector: 'app-user-details-department-form',
  templateUrl: './user-details-department-form.component.html',
  styleUrl: './user-details-department-form.component.scss',
  imports: [
    FormRoot,
    FormField,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsDepartmentFormComponent implements OnInit {
  private readonly userDetailsStore = inject(UserDetailsStore);
  private readonly dispatcher = inject(Dispatcher);
  private readonly events = inject(Events);
  private readonly dialogRef = inject(MatDialogRef<UserDetailsDepartmentFormComponent, UserDetailsDepartmentFormResult | undefined>);

  public readonly departments = DEPARTMENTS;
  public readonly currentUser = computed(() => this.userDetailsStore.user());
  public readonly updateLoading = computed(() => this.userDetailsStore.updateLoading());

  public readonly model = signal<UserDetailsDepartmentModel>({
    ...emptyModel(),
  });

  public ngOnInit(): void {
    if (this.currentUser()) {
      this.model.set({
        department: this.currentUser()?.department ?? '',
      });
    }
  }

  public readonly userDetailsDepartmentForm = form(this.model, (root) => {
    required(root.department);
    validate(root.department, ({ value }) =>
      value().trim().length > 0
        ? undefined
        : { kind: 'required', message: 'Department is required' }
    );
  }, {
    submission: {
      action: async () => {
        const department = this.model().department.trim();
        this.dispatcher.dispatch(UserDetailsEvents.updateUserDetails({ payload: { department } }));
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
        department: this.userDetailsDepartmentForm.department().value(),
      },
      {
        department: currentUser.department,
      }
    );
  });

  #onSuccessUpdateDepartment = rxMethod<GetUser>(
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