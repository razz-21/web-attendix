import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { AuthStore } from '@/app/store/auth/auth.store';
import { DashboardService } from '@/app/services/dashboard.service';
import { GetAttendance } from '@/app/types/attendaces/attendances.types';
import { GetGroup } from '@/app/types/groups/groups.type';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTableModule,
    MatAutocompleteModule,
    DatePipe,
    TitleCasePipe
  ],
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly dashboardService = inject(DashboardService);

  public readonly user = computed(() => this.authStore.user());

  public searchQuery = '';
  public searchResults = signal<GetAttendance[]>([]);
  public suggestedGroups = signal<GetGroup[]>([]);
  public recentAttendances = signal<GetAttendance[]>([]);
  public loading = signal(false);

  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  public readonly tableColumns = ['name', 'code', 'status', 'updated_at'];

  public async ngOnInit(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.dashboardService.getDashboard() as any;
      this.suggestedGroups.set(data.suggested_groups);
      this.recentAttendances.set(data.recent_attendances);
    } finally {
      this.loading.set(false);
    }
  }

  public searchAttendances(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    if (!this.searchQuery.trim()) {
      this.searchResults.set([]);
      return;
    }

    this.searchDebounceTimer = setTimeout(async () => {
      const results = await this.dashboardService.searchAttendances(this.searchQuery) as any;
      this.searchResults.set(results);
    }, 300);
  }

  public goToGroup(group: any): void {
    this.router.navigate(['/main/groups', group.id, 'members']);
  }

  public goToAttendance(attendance: GetAttendance): void {
    this.router.navigate(['/main/attendances', attendance.id]);
  }

  public onSelectAttendance(event: any): void {
    const selected = this.searchResults().find(item => item.name === event.option.value);
    if (selected) {
      this.goToAttendance(selected);
    }
    this.searchQuery = '';
    this.searchResults.set([]);
  }
}