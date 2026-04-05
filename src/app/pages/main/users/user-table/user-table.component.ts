import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface UserTableRow {
  rfid: string;
  firstname: string;
  lastname: string;
  email: string;
  department: string;
  status: 'active' | 'inactive' | 'needs_verification';
}

const MOCK_USERS: UserTableRow[] = [
  {
    rfid: 'RFID-7A2F-9011',
    firstname: 'Jordan',
    lastname: 'Lee',
    email: 'jordan.lee@example.com',
    department: 'Engineering',
    status: 'active',
  },
  {
    rfid: 'RFID-3C8B-4402',
    firstname: 'Sam',
    lastname: 'Rivera',
    email: 'sam.rivera@example.com',
    department: 'Human Resources',
    status: 'inactive',
  },
  {
    rfid: 'RFID-9D1E-7720',
    firstname: 'Alex',
    lastname: 'Chen',
    email: 'alex.chen@example.com',
    department: 'Operations',
    status: 'needs_verification',
  },
];

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.scss',
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule],
})
export class UserTableComponent {
  protected readonly displayedColumns: string[] = [
    'rfid',
    'fullname',
    'email',
    'department',
    'status',
    'actions',
  ];

  protected readonly dataSource: UserTableRow[] = MOCK_USERS;

  protected fullName(row: UserTableRow): string {
    return `${row.firstname} ${row.lastname}`.trim();
  }

  protected formatStatus(status: UserTableRow['status']): string {
    return status.replace(/_/g, ' ');
  }

  public viewUser(row: UserTableRow): void {
    console.log(row);
  }
}
