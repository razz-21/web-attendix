import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { GetAttendance } from '@/app/types/attendance/attendance.types';
import { AttendanceDetailsStore } from '@/app/store/attendance-details/attendance-details.store';
import qrcode from 'qrcode-generator';

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

  public readonly attendanceName = computed(() => this.attendanceDetailsStore.attendanceDetails()?.name ?? '');

  public readonly qrCodeSvg = signal<SafeHtml>('');
  public readonly qrError = signal<string | null>(null);

  public ngOnInit(): void {
    this.generateQrCode();
  }

  private generateQrCode(): void {
    try {
      if (!this.record) {
        this.qrError.set('No attendance record data available.');
        return;
      }

      const qrData = JSON.stringify(this.record);

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
