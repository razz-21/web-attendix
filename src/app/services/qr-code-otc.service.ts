import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class QrCodeOtcStateService {
  private savedTimes: { [recordId: string]: number } = {};

  public getPausedState(recordId: string): number | undefined {
    return this.savedTimes[recordId];
  }

  public setPausedState(recordId: string, expiresIn: number): void {
    this.savedTimes[recordId] = expiresIn;
  }

  public clearPausedState(recordId: string): void {
    delete this.savedTimes[recordId];
  }
}