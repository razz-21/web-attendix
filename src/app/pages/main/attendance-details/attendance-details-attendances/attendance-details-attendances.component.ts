import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { AttendanceTableComponent } from '../attendance-details-attendances/attendance-details-table/attendance-details-table.component';
import { AttendanceFormModalComponent } from '../attendance-details-attendances/attendance-details-form-modal/attendance-details-form-modal.component';
import type { GetAttendance } from '@/app/types/attendance/attendance.types';
import { EditAttendanceModalComponent } from '../attendance-details-attendances/edit-attendance-form-modal/edit-attendance-form-modal.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AttendanceStore } from '@/app/store/attendance/attendance.store';
import { AttendanceEvents } from '@/app/store/attendance/attendance.events';
import { AttendanceDetailsStore } from '@/app/store/attendance-details/attendance-details.store';
import { Dispatcher } from '@ngrx/signals/events';
import { AttendanceDrawerComponent } from './attendance-drawer/attendance-drawer.component';

@Component({
  selector: 'app-attendance-details-attendances',
  templateUrl: './attendance-details-attendances.component.html',
  styleUrls: ['./attendance-details-attendances.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, MatSidenavModule, AttendanceTableComponent, AttendanceDrawerComponent],
})
export class AttendanceDetailsAttendancesComponent {
  private readonly drawerHost: Signal<ElementRef<HTMLElement> | undefined> = viewChild(
    'drawerHost',
    { read: ElementRef },
  );

  private readonly dialog = inject(MatDialog);
  private readonly dispatcher = inject(Dispatcher);
  private readonly attendanceStore = inject(AttendanceStore);
  private readonly attendanceDetailsStore = inject(AttendanceDetailsStore);
  
  /** After opening, ignores the opener's bubbled click; then enables closing on outside click. */
  private readonly outsideClickArmed = signal(false);

  public readonly drawerOpen = computed(() => this.attendanceStore.drawerOpen());
  public readonly isArchived = computed(() => this.attendanceDetailsStore.attendanceDetails()?.status === 'archived');

  constructor() {
    effect((onCleanup) => {
      if (!this.drawerOpen()) {
        this.outsideClickArmed.set(false);
        return;
      }
      this.outsideClickArmed.set(false);
      const id = window.setTimeout(() => {
        this.outsideClickArmed.set(true);
      }, 0);
      onCleanup(() => {
        window.clearTimeout(id);
        this.outsideClickArmed.set(false);
      });
    });

    fromEvent(document, 'click')
      .pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (!this.drawerOpen() || !this.outsideClickArmed()) {
          return;
        }
        const target = event.target;
        if (!(target instanceof Node)) {
          return;
        }
        const host = this.drawerHost()?.nativeElement;
        if (host?.contains(target)) {
          return;
        }
        this.closeDrawer();
      });
  }

  public closeDrawer(): void {
    this.dispatcher.dispatch(AttendanceEvents.selectAttendance({ attendance: null }));
  }

  public openAddRecord(): void {
    this.dialog.open<AttendanceFormModalComponent, undefined, GetAttendance | undefined>(
      AttendanceFormModalComponent,
      {
        maxWidth: '620px',
        width: '100%',
        height: 'auto',
        autoFocus: 'first-tabbable',
      }
    );
  }

  public openEditDetails(row: GetAttendance): void {
    this.dialog.open(EditAttendanceModalComponent, {
      maxWidth: '620px',
      width: '100%',
      data: row, 
    });
  }
}