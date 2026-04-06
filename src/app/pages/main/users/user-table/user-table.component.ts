import { TextTransformToReadablePipe } from '@pipes/text-transform-to-readable.pipe';
import { UserStatusSchema } from '@/app/types/users/users.schema';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmationDialogService } from '@/app/services/confirmation-dialog.service';

export interface UserTableRow {
  rfid: string;
  firstname: string;
  lastname: string;
  email: string;
  department: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'needs_verification';
}

const MOCK_USERS: UserTableRow[] = [
  {
    rfid: 'RFID-7A2F-9011',
    firstname: 'Jordan',
    lastname: 'Lee',
    email: 'jordan.lee@example.com',
    department: 'Engineering',
    role: 'admin',
    status: 'active',
  },
  {
    rfid: 'RFID-3C8B-4402',
    firstname: 'Sam',
    lastname: 'Rivera',
    email: 'sam.rivera@example.com',
    department: 'Human Resources',
    role: 'user',
    status: 'inactive',
  },
  {
    rfid: 'RFID-9D1E-7720',
    firstname: 'Alex',
    lastname: 'Chen',
    email: 'alex.chen@example.com',
    department: 'Operations',
    role: 'user',
    status: 'needs_verification',
  },
];

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.scss',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TextTransformToReadablePipe,
  ],
})
export class UserTableComponent {
  private readonly confirmationDialogService = inject(ConfirmationDialogService);

  protected readonly displayedColumns: string[] = [
    'rfid',
    'fullname',
    'email',
    'department',
    'role',
    'status',
    'actions',
  ];

  public readonly dataSource: UserTableRow[] = MOCK_USERS;

  public readonly userStatuses = UserStatusSchema.options;

  protected fullName(row: UserTableRow): string {
    return `${row.firstname} ${row.lastname}`.trim();
  }

  protected formatStatus(status: UserTableRow['status']): string {
    return status.replace(/_/g, ' ');
  }

  public viewUser(row: UserTableRow): void {
    console.log(row);
  }

  public async deleteUser(row: UserTableRow): Promise<void> {
    const result = await this.confirmationDialogService.confirm({
      title: 'Delete user',
      message: 'Are you sure you want to delete this user?',
      positiveButtonText: 'Yes, delete',
      negativeButtonText: 'No, cancel',
    });

    if (result) {
      console.log('User deleted', row);
    }
  }
}
