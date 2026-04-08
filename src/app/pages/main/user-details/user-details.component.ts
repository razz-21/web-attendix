import { Component, computed, effect, inject, Injectable, OnInit } from "@angular/core";
import { MatListModule } from "@angular/material/list";
import {MatRippleModule} from '@angular/material/core';
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { AvatarComponent } from "@/app/compponents/avatar/avatar.component";
import { ActivatedRoute, Router } from "@angular/router";
import { MAIN_USERS_PATH } from "@constants/route.constant";
import { Dispatcher } from "@ngrx/signals/events";
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
  private readonly userDetailsStore = inject(UserDetailsStore);

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

  public navigateBack(): void {
    this.router.navigate([MAIN_USERS_PATH]);
  }
}