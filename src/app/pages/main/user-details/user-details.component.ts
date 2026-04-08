import { Component, computed, effect, inject, Injectable, OnInit } from "@angular/core";
import { MatListModule } from "@angular/material/list";
import {MatRippleModule} from '@angular/material/core';
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { AvatarComponent } from "@/app/compponents/avatar/avatar.component";
import { ActivatedRoute, Router } from "@angular/router";
import { MAIN_USERS_PATH } from "@constants/route.constant";
import { Dispatcher, Events } from "@ngrx/signals/events";
import { UserDetailsStore } from "@store/user-details/user-details.store";
import { UserDetailsEvents } from "@store/user-details/user-details.events";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { TextTransformToReadablePipe } from "@pipes/text-transform-to-readable.pipe";
import { MatDialog } from "@angular/material/dialog";
import { UserDetailsNameFormComponent } from "./user-details-name-form/user-details-name-form.component";
import { UserDetailsDepartmentFormComponent } from "./user-details-department-form/user-details-department-form.component";
import { UserDetailsRoleFormComponent } from "./user-details-role-form/user-details-role-form.component";
import { UserDetailsPasswordFormComponent } from "./user-details-password-form/user-details-password-form.component";
import { UserDetailsStatusFormComponent } from "./user-details-status-form/user-details-status-form.component";
import { ConfirmationDialogService } from "@/app/services/confirmation-dialog.service";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, tap, map } from "rxjs";

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss',
  imports: [
    MatListModule,
    MatRippleModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    AvatarComponent,
    TextTransformToReadablePipe
  ]
})
export class UserDetailsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly dispatcher = inject(Dispatcher);
  private readonly events = inject(Events);
  private readonly userDetailsStore = inject(UserDetailsStore);
  private readonly confirmationDialogService = inject(ConfirmationDialogService);

  public readonly loading = computed(() => this.userDetailsStore.loading());
  public readonly user = computed(() => this.userDetailsStore.user());  

  public ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.dispatcher.dispatch(UserDetailsEvents.loadUserDetails({ id }));
    }
  }

  public openNameForm(): void {
    this.dialog.open(UserDetailsNameFormComponent, {
      width: '100%',
      maxWidth: '580px',
      height: 'auto',
      autoFocus: 'first-tabbable',
    });
  }

  public openDepartmentForm(): void {
    this.dialog.open(UserDetailsDepartmentFormComponent, {
      width: '100%',
      maxWidth: '580px',
      height: 'auto',
      autoFocus: 'first-tabbable',
    });
  }

  public openRoleForm(): void {
    this.dialog.open(UserDetailsRoleFormComponent, {
      width: '100%',
      maxWidth: '580px',
      height: 'auto',
      autoFocus: 'first-tabbable',
    });
  }

  public openPasswordForm(): void {
    this.dialog.open(UserDetailsPasswordFormComponent, {
      width: '100%',
      maxWidth: '580px',
      height: 'auto',
      autoFocus: 'first-tabbable',
    });
  }

  public openStatusForm(): void {
    this.dialog.open(UserDetailsStatusFormComponent, {
      width: '100%',
      maxWidth: '580px',
      height: 'auto',
      autoFocus: 'first-tabbable',
    });
  }

  public async openDeleteUserDialog(): Promise<void> {
    const result = await this.confirmationDialogService.confirm({
      title: 'Delete user',
      message: `Are you sure you want to delete this user <strong>${this.user()?.firstname} ${this.user()?.lastname}</strong>?`,
      positiveButtonText: 'Yes, delete',
      negativeButtonText: 'No, cancel',
    });

    if (result && this.user()) {
      this.dispatcher.dispatch(UserDetailsEvents.deleteUser({ user: this.user()! }));
    }
  }

  #onDeleteSuccess = rxMethod<boolean>(
    pipe(
      tap(() => {
        this.router.navigate([MAIN_USERS_PATH]);
      })
    )
  )(this.events.on(UserDetailsEvents.deleteUserSuccess).pipe(map(({ payload }) => payload)));

  public navigateBack(): void {
    this.router.navigate([MAIN_USERS_PATH]);
  }
}