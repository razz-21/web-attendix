import { Component } from '@angular/core';
import { AvatarComponent } from '@/app/compponents/avatar/avatar.component';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  imports: [AvatarComponent, RouterModule, MatIconModule]
})
export class AboutComponent {
  public readonly version = '1.0.0';

  public readonly features = [
    'Attendance tracking and management',
    'Attendee and group organization',
    'Reporting and analytics',
    'Role-based access control',
    'Workspace management',
  ];

  public readonly contributors = [
    { name: 'Ernesto Razo', role: 'Lead Developer', url: 'assets/images/Razz.jpg' },
    { name: 'Jose Manuel Borja', role: 'Junior Developer', url: 'assets/images/Jose.jpg' },
    { name: 'LA Leunel Valmoria', role: 'Junior Developer', url: 'assets/images/Leunel.jpg' },
    { name: 'Christian Carl Cabalde', role: 'Junior Developer', url: 'assets/images/cabalde.jpg' },
    { name: 'Ashton Nathaniel Lactuan', role: 'Junior Developer', url: 'assets/images/ashton.jpg' },
    { name: 'Alexy Paradillo', role: 'Junior Developer', url: 'assets/images/Alexy.jpg' },
    { name: 'Josh Daniel Israel Uy', role: 'QA', url: 'assets/images/Uy.jpg' },
  ];
}