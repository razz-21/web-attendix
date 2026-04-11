import { Component, signal } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { PersonalInformationSectionComponent } from "./personal-information-section/personal-information-section.component";
import { ManageAccountSectionComponent } from "./manage-account-section/manage-account-section.component";
import { RolesAndPermissionSectionComponent } from "./roles-and-permission-section/roles-and-permission-section.component";


export enum ProfileTab {
  PERSONAL_INFORMATION = 'personal-information',
  MANAGE_ACCOUNT = 'manage-account',
  ROLES_AND_PERMISSIONS = 'roles-and-permissions'
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  imports: [
    MatListModule,
    MatIconModule,
    PersonalInformationSectionComponent,
    ManageAccountSectionComponent,  
    RolesAndPermissionSectionComponent
  ]
})
export class ProfileComponent {

  public ProfileTab = ProfileTab;
  public activeTab = signal<ProfileTab>(ProfileTab.PERSONAL_INFORMATION);
  public readonly tabs = [
    {
      label: 'Personal Information',
      icon: 'person',
      value: ProfileTab.PERSONAL_INFORMATION
    },
    {
      label: 'Manage Account',
      icon: 'person_check',
      value: ProfileTab.MANAGE_ACCOUNT
    },
    {
      label: 'Roles and Permissions',
      icon: 'contacts_product',
      value: ProfileTab.ROLES_AND_PERMISSIONS
    }
  ];


  public onTabChange(tab: ProfileTab) {
    this.activeTab.set(tab);
  }
}