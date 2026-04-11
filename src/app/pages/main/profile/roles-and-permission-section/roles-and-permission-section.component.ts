import { Component, computed, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UserRole } from "@/app/types/users/users.type";
import { disabled, form, FormField, FormRoot, required, validate } from "@angular/forms/signals";
import { TextTransformToReadablePipe } from "@/app/pipes/text-transform-to-readable.pipe";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { UserRoleSchema } from "@/app/types/users/users.schema";
import { Dispatcher, Events } from "@ngrx/signals/events";
import { AuthStore } from "@/app/store/auth/auth.store";

interface RolesAndPermissionModel {
  role: UserRole;
}

@Component({
  selector: 'app-roles-and-permission-section',
  templateUrl: './roles-and-permission-section.component.html',
  styleUrl: './roles-and-permission-section.component.scss',
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    FormField,
    FormRoot,
    TextTransformToReadablePipe,
  ]
})
export class RolesAndPermissionSectionComponent {
  private readonly authStore = inject(AuthStore);
  private readonly dispatcher = inject(Dispatcher);
  private readonly events = inject(Events);

  public roles = UserRoleSchema.options;

  private emptyModel = (): RolesAndPermissionModel => ({
    role: 'user',
  });

  public rolesAndPermissionModel = signal<RolesAndPermissionModel>(this.emptyModel());

  public rolesAndPermissionForm = form(this.rolesAndPermissionModel, (root) => {
    required(root.role);
    disabled(root.role);
    validate(root.role, ({ value }) =>
      value().trim().length > 0
        ? undefined
        : { kind: 'required', message: 'Role is required' }
    );
  });

  public updateRoleLoading = computed(() => this.authStore.updateProfileLoading());
}