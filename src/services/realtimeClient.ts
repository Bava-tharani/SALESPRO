import { RealtimeEventType } from '../server/services/realtimeService';

export type RealtimeListener = (event: {
  type: RealtimeEventType | 'CONNECTED';
  userId?: string;
  userName?: string;
  leadId?: string;
  leadName?: string;
  callId?: string;
  data?: any;
  timestamp: string;
}) => void;

export class RealtimeClient {
  private static eventSource: EventSource | null = null;
  private static listeners: Set<RealtimeListener> = new Set();
  private static isConnected = false;

  public static connect(userId: string, role: string) {
    if (this.eventSource) {
      this.eventSource.close();
    }

    try {
      const url = `/api/realtime/stream?userId=${encodeURIComponent(userId)}&userRole=${encodeURIComponent(role)}`;
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        this.isConnected = true;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          this.listeners.forEach((listener) => listener(parsed));
        } catch (e) {
          console.warn('Realtime parse error:', e);
        }
      };

      this.eventSource.onerror = () => {
        this.isConnected = false;
      };
    } catch (err) {
      console.warn('Realtime connection error:', err);
    }
  }

  public static disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
    }
  }

  public static subscribe(listener: RealtimeListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
