import { Component, computed, inject, ElementRef, ViewChild, AfterViewInit, OnDestroy } from "@angular/core";
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
export class AttendanceDetailsAnalysisComponent implements AfterViewInit, OnDestroy {
  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;

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

  ngAfterViewInit(): void {
    this.initChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private initChart(): void {
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

    const data = attendanceIds.map(id =>
      records.filter(r => r.attendance_id === id && r.status === 'present').length
    );

    this.chart = new Chart(this.lineChartRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Present',
            data: attendanceIds.map(id => records.filter(r => r.attendance_id === id && r.status === 'present').length),
            borderColor: 'rgb(76, 175, 80)',
            backgroundColor: 'rgba(76, 175, 80, 0.05)',
            tension: 0.4,
            fill: true,
            pointRadius: 6,
            pointBackgroundColor: '#fff',
            pointBorderWidth: 2,
            pointBorderColor: 'rgb(76, 175, 80)',
          },
          {
            label: 'Late',
            data: attendanceIds.map(id => records.filter(r => r.attendance_id === id && r.status === 'late').length),
            borderColor: 'rgb(255, 152, 0)',
            backgroundColor: 'rgba(255, 152, 0, 0.05)',
            tension: 0.4,
            fill: true,
            pointRadius: 6,
            pointBackgroundColor: '#fff',
            pointBorderWidth: 2,
            pointBorderColor: 'rgb(255, 152, 0)',
          },
          {
            label: 'Excused',
            data: attendanceIds.map(id => records.filter(r => r.attendance_id === id && r.status === 'excused').length),
            borderColor: 'rgb(33, 150, 243)',
            backgroundColor: 'rgba(33, 150, 243, 0.05)',
            tension: 0.4,
            fill: true,
            pointRadius: 6,
            pointBackgroundColor: '#fff',
            pointBorderWidth: 2,
            pointBorderColor: 'rgb(33, 150, 243)',
          },
          {
            label: 'Absent',
            data: attendanceIds.map(id => records.filter(r => r.attendance_id === id && r.status === 'absent').length),
            borderColor: 'rgb(244, 67, 54)',
            backgroundColor: 'rgba(244, 67, 54, 0.05)',
            tension: 0.4,
            fill: true,
            pointRadius: 6,
            pointBackgroundColor: '#fff',
            pointBorderWidth: 2,
            pointBorderColor: 'rgb(244, 67, 54)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
          x: { grid: { display: false } },
        },
      },
    });
  }
}