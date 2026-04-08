import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { FormField, FormRoot, form, required, email, validate } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DEPARTMENTS } from '@/app/constants/departments.constant';
import { PostUserSchema, UserRoleSchema } from '@/app/types/users/users.schema';
import type { PostUser, UserRole } from '@/app/types/users/users.type';
import { TextTransformToReadablePipe } from '@/app/pipes/text-transform-to-readable.pipe';
import { Dispatcher } from '@ngrx/signals/events';
import { UsersEvents } from '@/app/store/users/users.events';
import { UsersStore } from '@/app/store/users/users.store';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface UserFormModel {
  rfid: string;
  firstname: string;
  lastname: string;
  email: string;
  department: string;
  username: string;
  role: UserRole;
  password: string;
  confirmPassword: string;
}

const emptyModel = (): UserFormModel => ({
  rfid: '',
  firstname: '',
  lastname: '',
  email: '',
  department: '',
  username: '',
  role: 'user',
  password: '',
  confirmPassword: '',
});

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormRoot,
    FormField,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    TextTransformToReadablePipe,
    MatProgressSpinnerModule
  ],
})
export class UserFormComponent {
  private readonly dispatcher = inject(Dispatcher);
  private readonly usersStore = inject(UsersStore);

  public readonly model = signal<UserFormModel>(emptyModel());
  public readonly passwordHidden = signal(true);
  public readonly confirmPasswordHidden = signal(true);

  public readonly userCancelled = output<void>();

  public readonly departments = DEPARTMENTS;
  public readonly roles = UserRoleSchema.options;

  public readonly loadingForm = computed(() => this.usersStore.loadingForm());

  public readonly userForm = form(this.model, (root) => {
    required(root.rfid);
    required(root.firstname);
    required(root.lastname);
    required(root.email);
    email(root.email);
    required(root.department);
    required(root.role);
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
        const m = this.model();
        const now = new Date().toISOString();
        const payload: PostUser = {
          id: crypto.randomUUID(),
          rfid: m.rfid.trim(),
          firstname: m.firstname.trim(),
          lastname: m.lastname.trim(),
          email: m.email.trim(),
          department: m.department.trim(),
          role: m.role,
          username: m.username.trim(),
          password: m.password,
          status: 'needs_verification',
          created_at: now,
          updated_at: now,
        };
        PostUserSchema.parse(payload);
        this.dispatcher.dispatch(UsersEvents.createUser({ user: payload }));
        return undefined;
      },
    },
  });

  public cancel(): void {
    this.userCancelled.emit();
  }
}
