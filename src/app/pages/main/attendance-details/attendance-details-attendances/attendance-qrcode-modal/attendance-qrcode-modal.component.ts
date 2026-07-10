import { ChangeDetectionStrategy, Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { DatePipe, DOCUMENT } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { GetAttendance } from '@/app/types/attendance/attendance.types';
import { AttendanceDetailsStore } from '@/app/store/attendance-details/attendance-details.store';
import { HttpClient } from '@angular/common/http';
import { environment } from '@/environments/environment';
import { lastValueFrom } from 'rxjs';
import qrcode from 'qrcode-generator';
import { QrCodeOtcStateService } from '@/app/services/qr-code-otc.service';

interface PublicAttendanceLinkParams {
  attendances_id: string;
  /** Session attendance id (public route `:attendee_id` segment). */
  attendance_id: string;
  attendance_name: string;
  attendance_date: string;
  code: string;
  enable_otc: boolean;
}

function buildPublicAttendancePath(params: PublicAttendanceLinkParams): string {
  const query = new URLSearchParams({
    attendance_name: params.attendance_name,
    attendance_date: params.attendance_date,
    code: params.code,
    enable_otc: String(params.enable_otc),
  });
  return `/public-attendance/${params.attendances_id}/${params.attendance_id}?${query.toString()}`;
}

function buildPublicAttendanceUrl(origin: string, params: PublicAttendanceLinkParams): string {
  return `${origin}${buildPublicAttendancePath(params)}`;
}

@Component({
  selector: 'app-attendance-qrcode-modal',
  templateUrl: './attendance-qrcode-modal.component.html',
  styleUrl: './attendance-qrcode-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class AttendanceQrcodeModalComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<AttendanceQrcodeModalComponent>);
  public readonly record = inject<GetAttendance>(MAT_DIALOG_DATA);
  private readonly attendanceDetailsStore = inject(AttendanceDetailsStore);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly document = inject(DOCUMENT);
  private readonly http = inject(HttpClient);
  private readonly otcStateService = inject(QrCodeOtcStateService);

  public readonly attendanceName = computed(() => this.attendanceDetailsStore.attendanceDetails()?.name ?? '');

  public readonly enableOtc = this.record.session_state === 'on';

  public readonly qrCodeSvg = signal<SafeHtml>('');
  public readonly qrError = signal<string | null>(null);
  public readonly otc = signal<string>('---');
  public readonly expiresIn = signal<number>(15);

  private otcInterval: ReturnType<typeof setInterval> | null = null;

  public async ngOnInit(): Promise<void> {
    this.generateQrCode();

    if (!this.enableOtc) {
      return;
    }

    await this.fetchOtc();

    const savedTime = this.otcStateService.getPausedState(this.record.id);

    if (savedTime !== undefined) {
      this.expiresIn.set(savedTime);
      this.otcStateService.clearPausedState(this.record.id);
    }

    this.otcInterval = setInterval(async () => {
      const newTime = this.expiresIn() - 1;

      if (newTime <= 0) {
        await this.fetchOtc();
        this.expiresIn.set(15);
      } else {
        this.expiresIn.set(newTime);
      }
    }, 1000);
  }

  public ngOnDestroy(): void {
    if (this.otcInterval) {
      clearInterval(this.otcInterval);
      this.otcInterval = null;
    }

    if (this.enableOtc) {
      this.otcStateService.setPausedState(this.record.id, this.expiresIn());
    }

  }

  private async fetchOtc(): Promise<void> {
    try {
      const result = await lastValueFrom(
        this.http.get<{ otc: string; expires_in: number }>(
          `${environment.apiBaseUrl}/api/v1/attendances/${this.record.id}/otc`
        )
      );
      this.otc.set(result.otc);
      this.expiresIn.set(result.expires_in);
    } catch {
      this.otc.set('---');
      this.expiresIn.set(0);
    }
  }

  private generateQrCode(): void {
    try {
      if (!this.record) {
        this.qrError.set('No attendance record data available.');
        return;
      }

      const code = this.attendanceDetailsStore.attendanceDetails()?.code;
      if (!code) {
        this.qrError.set('Attendance code is not available.');
        return;
      }

      const qrData = buildPublicAttendanceUrl(this.document.location.origin, {
        attendances_id: this.record.attendances_id,
        attendance_id: this.record.id,
        attendance_name: this.record.name,
        attendance_date: this.record.attendance_date,
        code,
        enable_otc: this.record.session_state === 'on',
      });

      const qr = qrcode(0, 'M');
      qr.addData(qrData);
      qr.make();

      const svgTag = qr.createSvgTag({ cellSize: 5, margin: 4 });
      this.qrCodeSvg.set(this.sanitizer.bypassSecurityTrustHtml(svgTag));
      this.qrError.set(null);
    } catch {
      this.qrError.set('Failed to generate QR code. The attendance data may be invalid.');
    }
  }

  public closeDialog(): void {
    this.dialogRef.close();
  }
}
