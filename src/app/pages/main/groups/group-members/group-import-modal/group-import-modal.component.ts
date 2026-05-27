import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Dispatcher, Events } from '@ngrx/signals/events';
import { GroupMembersEvents } from '@/app/store/group-members/group-members.events';
import { GroupMembersStore } from '@/app/store/group-members/group-members.store';
import { GetGroupMember, GroupMember, PostGroupMember } from '@/app/types/group-members/group-members.type';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, map } from 'rxjs';

@Component({
  selector: 'app-group-import-modal',
  templateUrl: './group-import-modal.component.html',
  styleUrl: './group-import-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export class GroupImportModalComponent {
  private readonly dialogRef = inject(MatDialogRef<GroupImportModalComponent>);
  private readonly data = inject<{ group_id: string }>(MAT_DIALOG_DATA);
  private readonly dispatcher = inject(Dispatcher);
  private readonly events = inject(Events);
  private readonly groupMembersStore = inject(GroupMembersStore);

  public readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  public readonly group_id = computed(() => this.data.group_id);
  public readonly importLoading = computed(() => this.groupMembersStore.loadingForm());

  public isDragOver = false;
  public selectedFile: File | null = null;
  public selectedFileName = '';

  public closeDialog(): void {
    this.dialogRef.close();
  }

  public triggerFileInput(): void {
    this.fileInput()?.nativeElement.click();
  }

  public onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.setFile(file);
      this.parseAndImport();
    }
  }

  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  public onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  public onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv'))) {
      this.setFile(file);
      this.parseAndImport();
    }
  }

  private setFile(file: File): void {
    this.selectedFile = file;
    this.selectedFileName = file.name;
  }

  private parseAndImport(): void {
    const file = this.selectedFile;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) ?? '';
      const parseCsvRows = (input: string): string[][] => {
        const rows: string[][] = [];
        let row: string[] = [];
        let cell = '';
        let inQuotes = false;

        for (let i = 0; i < input.length; i++) {
          const char = input[i];

          if (inQuotes) {
            if (char === '"') {
              // Escaped quote inside a quoted value: ""
              if (input[i + 1] === '"') {
                cell += '"';
                i++;
              } else {
                inQuotes = false;
              }
            } else {
              cell += char;
            }
            continue;
          }

          if (char === '"') {
            inQuotes = true;
            continue;
          }

          if (char === ',') {
            row.push(cell.trim());
            cell = '';
            continue;
          }

          if (char === '\r') {
            continue; // ignore CR (to support \r\n)
          }

          if (char === '\n') {
            row.push(cell.trim());
            cell = '';

            // Push row even if empty; we'll filter later.
            rows.push(row);
            row = [];
            continue;
          }

          cell += char;
        }

        // Flush last cell/row (handles files without a trailing newline).
        if (cell.length > 0 || row.length > 0) {
          row.push(cell.trim());
          rows.push(row);
        }

        return rows;
      };

      const rows = parseCsvRows(text).filter(r => r.some(c => c.length > 0));

      if (rows.length < 2) {
        alert('CSV file must have at least one data row.');
        return;
      }

      const headers = rows[0].map(h => h.replace(/^\uFEFF/, '').trim().toLowerCase());
      const get = (key: string) => headers.indexOf(key);

      const studentIdIndex = get('rfid');
      const nameIndex = get('name');
      const departmentIndex = get('department');
      const sectionIndex = get('section');
      const yearLevelIndex = get('year_level');

      if (studentIdIndex === -1 || nameIndex === -1) {
        alert('CSV headers must include at least: rfid, name');
        return;
      }

      const members: GroupMember[] = rows.slice(1).map(row => {
        const cols = row.map(c => c.trim());
        return {
          id: crypto.randomUUID(),
          rfid: cols[studentIdIndex] ?? '',
          name: cols[nameIndex] ?? '',
          department: departmentIndex !== -1 ? cols[departmentIndex] || undefined : undefined,
          section: sectionIndex !== -1 ? cols[sectionIndex] || undefined : undefined,
          year_level: yearLevelIndex !== -1 ? cols[yearLevelIndex] || undefined : undefined,
          group_type: 'student' as const,
          group_id: this.group_id(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }).filter(m => m.rfid !== '' && m.name !== '');

      const idCounts = new Map<string, number>();
      members.forEach(m => idCounts.set(m.rfid, (idCounts.get(m.rfid) ?? 0) + 1));
      const duplicates = [...idCounts.entries()].filter(([, count]) => count > 1).map(([id]) => id);

      if (duplicates.length > 0) {
        alert(`Duplicate student IDs in file:\n${duplicates.join(', ')}`);
        return;
      }

      this.dispatcher.dispatch(GroupMembersEvents.importGroupMembers({
        group_id: this.group_id(),
        members,
      }));
    };

    reader.onerror = () => alert('Error reading file.');
    reader.readAsText(file);
  }

  public downloadTemplate(): void {
    const csv = 'rfid,name,department,section,year_level\n2026001,Juan Dela Cruz,College of Information Technology,A,1st Year';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'group_members_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  #onImportGroupMembersSuccess = rxMethod<GetGroupMember[]>(
    pipe(
      tap((members) => {
        this.dialogRef.close(members);
      })
    )
  )(this.events.on(GroupMembersEvents.importGroupMembersSuccess).pipe(map(({ payload }) => payload)));
}