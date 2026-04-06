import { MatDialog } from "@angular/material/dialog";
import { ConfirmationDialogComponent, ConfirmationDialogData } from "../compponents/confirmation-dialog/confirmation-dialog.component";
import { inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class ConfirmationDialogService {
  private readonly dialog = inject(MatDialog);

  public open(data: ConfirmationDialogData): void {
    this.dialog.open(ConfirmationDialogComponent, { data });
  }

  public async confirm(data: ConfirmationDialogData): Promise<boolean> {
    const result = await firstValueFrom(
      this.dialog.open(ConfirmationDialogComponent, { data, maxWidth: '620px', minWidth: '420px' }).afterClosed()
    );

    return result === true;
  }
}