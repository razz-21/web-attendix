import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal, OnInit } from '@angular/core';
import { FormField, FormRoot, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AttendeesService } from '@/app/services/attendees.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DEPARTMENTS } from '@/app/constants/departments.constant';
import { YEAR_LEVELS } from '@/app/constants/year-levels.constant';
import type { PostAttendee, GetAttendee, PatchAttendee } from '@/app/types/attendaces/attendees.types';
import { Dispatcher } from '@ngrx/signals/events';
import { AttendanceAttendeeEvents } from '@/app/store/attendance-attendee/attendance-attendee.events';
import { AttendanceDetailsStore } from '@/app/store/attendance-details/attendance-details.store';

export interface AttendeeFormData {
  attendanceId: string;
  attendee?: GetAttendee;
}

interface AttendeeFormModel {
  rfid: string;
  name: string;
  department: string;
  section: string;
  year_level: string;
}

const emptyModel = (): AttendeeFormModel => ({ rfid: '', name: '', department: '', section: '', year_level: '' });

@Component({
  selector: 'app-attendee-form',
  templateUrl: './attendee-form.component.html',
  styleUrl: './attendee-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormRoot, FormField, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule],
})
export class AttendeeFormComponent implements OnInit {
  private readonly snackBar = inject(MatSnackBar);
  private readonly dispatcher = inject(Dispatcher);
  private readonly attendanceDetailsStore = inject(AttendanceDetailsStore);

  public readonly data = input.required<AttendeeFormData>();

  public readonly attendeeSaved = output<GetAttendee | undefined>();
  public readonly formCancelled = output<void>();

  public readonly model = signal<AttendeeFormModel>(emptyModel());

  public readonly departments = DEPARTMENTS;
  public readonly yearLevels = YEAR_LEVELS;

  public readonly loadingForm = signal(false);

  public readonly attendances_id = computed(() => this.attendanceDetailsStore.attendanceDetails()?.id ?? '');

  public ngOnInit(): void {
    const d = this.data();
    if (d?.attendee) {
      const m = d.attendee;
      this.model.set({
        rfid: m.rfid ?? '',
        name: m.name,
        department: m.department ?? '',
        section: m.section ?? '',
        year_level: m.year_level ?? '',
      });
    }
  }

  public readonly attendeeForm = form(this.model, (root) => {
    required(root.name);
  }, {
    submission: {
      action: async () => {
        this.loadingForm.set(true);
        try {
          const d = this.data();
          if (!d) {
            this.snackBar.open('Missing attendance context', 'Close', { duration: 6000 });
            return undefined;
          }

          const m = this.model();
          const payload: PostAttendee | PatchAttendee = {
            rfid: m.rfid?.trim() || undefined,
            name: m.name.trim(),
            department: m.department?.trim() || undefined,
            section: m.section?.trim() || undefined,
            year_level: m.year_level?.trim() || undefined,
            attendance_id: d.attendanceId,
            attendances_id: this.attendances_id(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as PostAttendee;

          if (d.attendee) {
            this.dispatcher.dispatch(AttendanceAttendeeEvents.updateAttendee({
              attendance_id: d.attendanceId,
              id: d.attendee.id,
              data: payload as PatchAttendee,
            }));
          } else {
            this.dispatcher.dispatch(AttendanceAttendeeEvents.createAttendee({
              attendance_id: d.attendanceId,
              attendee: payload as PostAttendee,
            }));
          }
          return undefined;
        } catch (error) {
          console.error('[AttendeeForm] error:', error);
        } finally {
          this.loadingForm.set(false);
        }
      },
    },
  });

  public cancel(): void {
    this.formCancelled.emit();
  }
}
