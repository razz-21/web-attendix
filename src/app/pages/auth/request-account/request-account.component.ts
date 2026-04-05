import { Component } from '@angular/core';
import { RequestAccountFormComponent } from './request-account-form/request-account-form.component';

@Component({
  selector: 'app-request-account',
  imports: [RequestAccountFormComponent],
  templateUrl: './request-account.component.html',
  styleUrl: './request-account.component.scss',
})
export class RequestAccountComponent {}