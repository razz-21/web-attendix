import { Component, computed, inject, ElementRef, viewChild, effect, OnDestroy } from "@angular/core";
import { AttendanceRecordStore } from '@/app/store/attendance-record/attendance-record.store';
import { AttendanceAttendeeStore } from '@/app/store/attendance-attendee/attendance-attendee.store';
import { AttendanceStore } from '@/app/store/attendance/attendance.store';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-attendance-details-analysis',
  templateUrl: './attendance-details-analysis.component.html',
  styleUrls: ['./attendance-details-analysis.component.scss'],
})
export class AttendanceDetailsAnalysisComponent implements OnDestroy {
  private readonly lineChartRef = viewChild<ElementRef<HTMLCanvasElement>>('lineChart');

  private readonly recordStore = inject(AttendanceRecordStore);
  private readonly attendeeStore = inject(AttendanceAttendeeStore);
  private readonly attendanceStore = inject(AttendanceStore);

  private chart: Chart | null = null;

  private get records() {
    return this.recordStore.attendanceRecords();
  }

  private countByStatus(status: string): number {
    return this.records.filter(r => r.status === status).length;
  }

  public readonly loading = computed(() => this.recordStore.loading());
  public readonly error = computed(() => this.recordStore.error());
  public readonly totalAttendees = computed(() => this.attendeeStore.attendees().length);
  public readonly totalRecords = computed(() => this.records.length);
  public readonly totalAttendance = computed(() => new Set(this.records.map(r => r.attendance_id)).size);
  public readonly totalPresent = computed(() => this.countByStatus('present'));
  public readonly totalLate = computed(() => this.countByStatus('late'));
  public readonly totalExcused = computed(() => this.countByStatus('excused'));
  public readonly totalAbsent = computed(() => this.countByStatus('absent'));

  public readonly attendanceAverage = computed(() => {
    const total = this.totalRecords();
    if (total === 0) return '0%';
    return `${Math.round(((this.totalPresent() + this.totalLate()) / total) * 100)}%`;
  });

  constructor() {
    // Rebuild the chart whenever the canvas becomes available or the underlying
    // records change. The canvas is behind @if blocks, so it may not exist on
    // first render (while loading or when there are no records yet).
    effect(() => {
      const canvasRef = this.lineChartRef();
      const hasData = this.totalRecords() > 0;
      if (!canvasRef || !hasData) {
        this.chart?.destroy();
        this.chart = null;
        return;
      }
      this.initChart(canvasRef.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private initChart(canvas: HTMLCanvasElement): void {
    this.chart?.destroy();
    const records = this.records;
    const sessions = this.attendanceStore.records();
    const attendanceIds = [...new Set(records.map(r => r.attendance_id))];

    attendanceIds.sort((a, b) => {
      const sessionA = sessions.find(s => s.id === a);
      const sessionB = sessions.find(s => s.id === b);
      const dateA = sessionA?.attendance_date ?? '';
      const dateB = sessionB?.attendance_date ?? '';
      return dateA.localeCompare(dateB);
    });

    const labels = attendanceIds.map(id => {
      const session = sessions.find(s => s.id === id);
      if (!session?.attendance_date) return `Session`;
      const date = new Date(session.attendance_date);
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    });

    const seriesFor = (status: string) =>
      attendanceIds.map(id => records.filter(r => r.attendance_id === id && r.status === status).length);

    // Soft, smooth area layers — same status colors as before but much lighter,
    // no visible points and minimal axes to match the reference aesthetic.
    const makeDataset = (label: string, status: string, rgb: string) => ({
      label,
      data: seriesFor(status),
      borderColor: `rgba(${rgb}, 0.45)`,
      backgroundColor: this.buildAreaGradient(canvas, rgb),
      borderWidth: 2,
      tension: 0.45,
      cubicInterpolationMode: 'monotone' as const,
      fill: true,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderWidth: 2,
      pointHoverBorderColor: `rgba(${rgb}, 0.9)`,
    });

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          makeDataset('Present', 'present', '76, 175, 80'),
          makeDataset('Late', 'late', '255, 152, 0'),
          makeDataset('Excused', 'excused', '33, 150, 243'),
          makeDataset('Absent', 'absent', '244, 67, 54'),
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: { usePointStyle: true, boxWidth: 8, boxHeight: 8, padding: 16 },
          },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            border: { display: false },
            ticks: { stepSize: 1, color: 'rgba(0, 0, 0, 0.35)' },
            grid: { color: 'rgba(0, 0, 0, 0.04)' },
          },
          x: {
            border: { display: false },
            ticks: { color: 'rgba(0, 0, 0, 0.35)', maxRotation: 0, autoSkip: true },
            grid: { display: false },
          },
        },
      },
    });
  }

  /** Vertical gradient fill: a light tint at the top fading to transparent at the bottom. */
  private buildAreaGradient(canvas: HTMLCanvasElement, rgb: string): CanvasGradient | string {
    const ctx = canvas.getContext('2d');
    if (!ctx) return `rgba(${rgb}, 0.08)`;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `rgba(${rgb}, 0.18)`);
    gradient.addColorStop(1, `rgba(${rgb}, 0.01)`);
    return gradient;
  }
}