import { inject, Injectable } from '@angular/core';
import { Dispatcher } from '@ngrx/signals/events';
import { z } from 'zod';
import { environment } from '@/environments/environment';
import { AttendanceRecordEvents } from '@/app/store/attendance-record/attendance-record.events';
import { GetAttendanceRecordSchema } from '@/app/types/attendance-record/attendance-record.schema';

const RealtimeMessageSchema = z.object({
  type: z.enum(['record.created', 'record.updated']),
  attendances_id: z.string(),
  data: GetAttendanceRecordSchema,
});

const RECONNECT_BASE_DELAY_MS = 1_000;
const RECONNECT_MAX_DELAY_MS = 30_000;

/**
 * Maintains a single WebSocket connection to the server and feeds real-time
 * attendance-record changes into the store. Call {@link connect} with the
 * attendance event id when a detail page opens, and {@link disconnect} when it
 * closes (handled automatically on the injecting context's destroy).
 */
@Injectable({ providedIn: 'root' })
export class AttendanceRecordRealtimeService {
  private readonly dispatcher = inject(Dispatcher);

  private socket: WebSocket | null = null;
  private attendancesId: string | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private manuallyClosed = false;

  /** Open (or re-target) the realtime connection for an attendance event. */
  public connect(attendancesId: string): void {
    if (!attendancesId) return;

    // Already connected to this room — nothing to do.
    if (this.attendancesId === attendancesId && this.socket) {
      return;
    }

    this.attendancesId = attendancesId;
    this.manuallyClosed = false;

    // Reuse an open socket by switching rooms instead of reconnecting.
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'subscribe', attendances_id: attendancesId }));
      return;
    }

    this.openSocket();
  }

  /** Close the connection and stop any pending reconnect attempts. */
  public disconnect(): void {
    this.manuallyClosed = true;
    this.attendancesId = null;
    this.reconnectAttempts = 0;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
  }

  private openSocket(): void {
    const attendancesId = this.attendancesId;
    if (!attendancesId) return;

    const url = this.buildUrl(attendancesId);
    const socket = new WebSocket(url);
    this.socket = socket;

    socket.onopen = () => {
      this.reconnectAttempts = 0;
    };

    socket.onmessage = (event) => this.handleMessage(event);

    socket.onclose = () => {
      if (this.socket === socket) {
        this.socket = null;
      }
      if (!this.manuallyClosed) {
        this.scheduleReconnect();
      }
    };

    socket.onerror = () => {
      // The close handler drives reconnection; just close on error.
      socket.close();
    };
  }

  private handleMessage(event: MessageEvent): void {
    let parsed: unknown;
    try {
      parsed = JSON.parse(event.data);
    } catch {
      return;
    }

    const result = RealtimeMessageSchema.safeParse(parsed);
    if (!result.success) return;

    // Ignore events for a room we are no longer viewing.
    if (result.data.attendances_id !== this.attendancesId) return;

    this.dispatcher.dispatch(
      AttendanceRecordEvents.attendanceRecordReceived(result.data.data),
    );
  }

  private scheduleReconnect(): void {
    if (this.manuallyClosed || !this.attendancesId) return;
    if (this.reconnectTimer) return;

    const delay = Math.min(
      RECONNECT_BASE_DELAY_MS * 2 ** this.reconnectAttempts,
      RECONNECT_MAX_DELAY_MS,
    );
    this.reconnectAttempts += 1;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.openSocket();
    }, delay);
  }

  private buildUrl(attendancesId: string): string {
    const base = environment.apiBaseUrl.replace(/^http(s?):\/\//, (_match, secure) =>
      secure ? 'wss://' : 'ws://',
    );
    return `${base}/ws?attendances_id=${encodeURIComponent(attendancesId)}`;
  }
}
