import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, resource, signal } from '@angular/core';
import { disabled, FormField, FormRoot, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import {
  MarkPublicAttendanceParams,
  PublicAttendanceService,
} from '@/app/services/public-attendance.service';

export interface PublicAttendanceModel {
  code: string;
  rfid: string;
}

@Component({
  selector: 'app-public-attendance',
  templateUrl: './public-attendance.component.html',
  styleUrl: './public-attendance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    FormField,
    FormRoot,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
})
export class PublicAttendanceComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly publicAttendanceService = inject(PublicAttendanceService);

  public readonly attendancesId = this.route.snapshot.paramMap.get('attendances_id');
  public readonly attendanceId = this.route.snapshot.paramMap.get('attendee_id');
  public readonly attendanceName = this.route.snapshot.queryParamMap.get('attendance_name');
  public readonly attendanceDate = this.route.snapshot.queryParamMap.get('attendance_date');

  public readonly linkError = signal<string | null>(null);
  public readonly submitParams = signal<MarkPublicAttendanceParams | undefined>(undefined);

  public readonly markAttendanceResource = resource({
    params: () => this.submitParams(),
    loader: ({ params }) => this.publicAttendanceService.markAttendance(params),
  });

  public readonly submitting = this.markAttendanceResource.isLoading;
  public readonly submitSuccess = computed(
    () => this.markAttendanceResource.status() === 'resolved',
  );
  public readonly submitError = computed(() => {
    const linkError = this.linkError();
    if (linkError) {
      return linkError;
    }

    const error = this.markAttendanceResource.error();
    if (!error) {
      return null;
    }

    return this.#getErrorMessage(error);
  });

  public readonly model = signal<PublicAttendanceModel>({
    code: this.route.snapshot.queryParamMap.get('code') ?? '',
    rfid: '',
  });

  public readonly attendanceForm = form(this.model, (root) => {
    disabled(root.code);
    required(root.rfid);
  }, {
    submission: {
      action: async () => {
        if (!this.attendancesId || !this.attendanceId) {
          this.linkError.set('This attendance link is invalid.');
          return;
        }

        this.linkError.set(null);
        this.submitParams.set({
          attendances_id: this.attendancesId,
          attendance_id: this.attendanceId,
          rfid: this.attendanceForm.rfid().value().trim(),
        });
      },
    },
  });

  #getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error;
      if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
        return body.error;
      }
    }

    return 'Failed to mark attendance. Please try again.';
  }
}
