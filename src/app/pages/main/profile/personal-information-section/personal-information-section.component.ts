import { AvatarComponent } from "@/app/compponents/avatar/avatar.component";
import { DEPARTMENTS } from "@/app/constants/departments.constant";
import { AuthEvents } from "@/app/store/auth/auth.events";
import { AuthStore } from "@/app/store/auth/auth.store";
import { isObjectsTheSame } from "@/app/utils/is-objects-the-same";
import { CommonModule } from "@angular/common";
import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { disabled, email, FormField, FormRoot, required } from "@angular/forms/signals";
import { form } from "@angular/forms/signals";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { Dispatcher } from "@ngrx/signals/events";


export interface PersonalInformationModel {
  firstname: string;
  lastname: string;
  email: string;
  department: string;
  rfid: string;
}

@Component({
  selector: 'app-personal-information-section',
  templateUrl: './personal-information-section.component.html',
  styleUrl: './personal-information-section.component.scss',
  imports: [
    AvatarComponent,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    FormField,
    FormRoot,
  ],
})
export class PersonalInformationSectionComponent implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly dispatcher = inject(Dispatcher);

  public readonly fullName = computed(() => this.authStore.user()?.firstname + ' ' + this.authStore.user()?.lastname);
  
  private readonly emptyModel = (): PersonalInformationModel => ({
    firstname: '',
    lastname: '',
    email: '',
    department: '',
    rfid: '',
  });

  public personalInformationModel = signal<PersonalInformationModel>(this.emptyModel());
  
  public personalInformationForm = form(this.personalInformationModel, (root) => {
    required(root.firstname);
    required(root.lastname);
    required(root.email);
    email(root.email);
    disabled(root.email);
    required(root.department);
    required(root.rfid);
  }, {
    submission: {
      action: async () => {
        if (this.disabledForm()) {
          return;
        }

        this.dispatcher.dispatch(AuthEvents.updateProfile({ payload: {
          firstname: this.personalInformationModel().firstname,
          lastname: this.personalInformationModel().lastname,
          department: this.personalInformationModel().department,
          rfid: this.personalInformationModel().rfid,
        } }));
      },
    },
  });

  public departments = signal(DEPARTMENTS);

  public updateProfileLoading = computed(() => this.authStore.updateProfileLoading());

  public disabledForm = computed(() => this.updateProfileLoading() || this.isValueIsTheSameWithCurrentValue() || (this.personalInformationForm().invalid() && this.personalInformationForm().touched()));

  public isValueIsTheSameWithCurrentValue = computed(() => {
    const currentUser = {
      firstname: this.authStore.user()?.firstname ?? '',
      lastname: this.authStore.user()?.lastname ?? '',
      email: this.authStore.user()?.email ?? '',
      department: this.authStore.user()?.department ?? '',
      rfid: this.authStore.user()?.rfid ?? '',
    }

    return isObjectsTheSame(this.personalInformationModel(), currentUser);
  });

  public ngOnInit(): void {
    if (this.authStore.user()) {
      this.personalInformationModel.set({
        firstname: this.authStore.user()?.firstname ?? '',
        lastname: this.authStore.user()?.lastname ?? '',
        email: this.authStore.user()?.email ?? '',
        department: this.authStore.user()?.department ?? '',
        rfid: this.authStore.user()?.rfid ?? '',
      });
    }
  }

  public updateProfile() {
    console.log('updateProfile');
  }
}