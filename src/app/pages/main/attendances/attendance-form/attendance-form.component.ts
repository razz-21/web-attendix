import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormField, FormRoot, form, required, min, validate } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { sortScheduleDays } from '@/app/constants/schedule-days.constant';

const SCHEDULE_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export interface AttendanceFormModel {
  name: string;
  code: string;
  description: string;
  status: 'Active' | 'Archived';
  lateThreshold: number;
  scheduleDays: string[];
}

const emptyModel = (): AttendanceFormModel => ({
  name: '',
  code: '',
  description: '',
  status: 'Active',
  lateThreshold: 15,
  scheduleDays: [],
});

@Component({
  selector: 'app-attendance-form',
  templateUrl: './attendance-form.component.html',
  styleUrl: './attendance-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormRoot,
    FormField,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export class AttendanceFormComponent {
  public readonly initialData = input<AttendanceFormModel | null>(null);
  public readonly submitting = input(false);
  public readonly model = signal<AttendanceFormModel>(emptyModel());

  public readonly formCancelled = output<void>();
  public readonly formSubmitted = output<AttendanceFormModel>();

  public readonly scheduleDays = SCHEDULE_DAYS;

  public readonly generatedCode = computed(() => {
    const uuid = crypto.randomUUID().replace(/-/g, '');
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 8; i++) {
      const idx = parseInt(uuid.slice(i * 2, i * 2 + 2), 16) % 36;
      result += chars[idx];
    }
    return `${result.slice(0, 4)}-${result.slice(4, 8)}`;
  });

  constructor() {
    // Auto-fill code or initialize with data when component initializes
    effect(() => {
      const initial = this.initialData();
      if (initial) {
        this.model.set({ ...initial });
      } else {
        this.model.set({
          ...emptyModel(),
          code: this.generatedCode(),
        });
      }
    }, { allowSignalWrites: true });
  }

  public readonly attendanceForm = form(this.model, (root) => {
    required(root.name);
    required(root.description);
    required(root.lateThreshold);
    min(root.lateThreshold, 1);
    validate(root.scheduleDays, () => {
      return this.model().scheduleDays.length === 0 ? [{ kind: 'required' }] : null;
    });
  }, {
    submission: {
      action: async () => {
        this.formSubmitted.emit(this.model());
        return undefined;
      },
    },
  });

  public readonly isLoadingForm = computed(() => this.submitting());

  public toggleScheduleDay(day: string): void {
    const current = this.model().scheduleDays;
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day];
    this.model.update(m => ({ ...m, scheduleDays: sortScheduleDays(updated) }));
  }

  public isScheduleDaySelected(day: string): boolean {
    return this.model().scheduleDays.includes(day);
  }

  public cancel(): void {
    this.formCancelled.emit();
  }
}
