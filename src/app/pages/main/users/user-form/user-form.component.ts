import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { FormField, FormRoot, form, required, validate } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DEPARTMENTS } from '@/app/constants/departments.constant';
import { PostUserSchema } from '@/app/types/users/users.schema';
import type { PostUser } from '@/app/types/users/users.type';

export interface UserFormModel {
  rfid: string;
  firstname: string;
  lastname: string;
  department: string;
  username: string;
  password: string;
  confirmPassword: string;
}

const emptyModel = (): UserFormModel => ({
  rfid: '',
  firstname: '',
  lastname: '',
  department: '',
  username: '',
  password: '',
  confirmPassword: '',
});

@Component({
  selector: 'app-user-form',
  imports: [FormRoot, FormField, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent {
  public readonly departments = DEPARTMENTS;
  public readonly model = signal<UserFormModel>(emptyModel());
  public readonly passwordHidden = signal(true);
  public readonly confirmPasswordHidden = signal(true);

  public readonly userCreated = output<PostUser>();
  public readonly userCancelled = output<void>();

  public readonly userForm = form(this.model, (root) => {
    required(root.rfid);
    required(root.firstname);
    required(root.lastname);
    required(root.department);
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
          rfid: m.rfid.trim(),
          firstname: m.firstname.trim(),
          lastname: m.lastname.trim(),
          department: m.department.trim(),
          role: 'user',
          username: m.username.trim(),
          password: m.password,
          status: 'needs_verification',
          createdAt: now,
          updatedAt: now,
        };
        PostUserSchema.parse(payload);
        this.userCreated.emit(payload);
        return undefined;
      },
    },
  });

  public cancel(): void {
    this.userCancelled.emit();
  }
}
