import { AUTH_LOGIN_PATH } from '@/app/constants/route.constant';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-request-account-success',
  imports: [MatCardModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './request-account-success.component.html',
  styleUrl: './request-account-success.component.scss',
})
export class RequestAccountSuccessComponent {
  protected readonly loginPath = AUTH_LOGIN_PATH;
}
