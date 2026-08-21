import { Response } from 'express';

export type RealtimeEventType =
  | 'SALESPERSON_ONLINE'
  | 'SALESPERSON_OFFLINE'
  | 'CALL_STARTED'
  | 'CALL_CONNECTED'
  | 'CALL_ENDED'
  | 'CALL_MISSED'
  | 'CALL_FAILED'
  | 'OUTCOME_ADDED'
  | 'LEAD_ASSIGNED'
  | 'FOLLOWUP_CREATED'
  | 'FOLLOWUP_COMPLETED'
  | 'LEAD_CONVERTED'
  | 'PERFORMANCE_UPDATED'
  | 'AI_ANALYSIS_COMPLETED'
  | 'HIGH_VALUE_INTENT_ALERT';

export interface RealtimeEventPayload {
  type: RealtimeEventType;
  userId?: string;
  userName?: string;
  leadId?: string;
  leadName?: string;
  callId?: string;
  data?: any;
  timestamp: string;
}

export class RealtimeService {
  private static clients: Array<{
    id: string;
    res: Response;
    userId: string;
    role: string;
  }> = [];

  public static addClient(id: string, res: Response, userId: string, role: string) {
    this.clients.push({ id, res, userId, role });
  }

  public static removeClient(id: string) {
    this.clients = this.clients.filter((c) => c.id !== id);
  }

  public static broadcast(payload: RealtimeEventPayload) {
    const data = `data: ${JSON.stringify(payload)}\n\n`;
    this.clients.forEach((client) => {
      // Role-based event filtering:
      // Manager gets all events.
      // Salesperson gets only events relating to their own actions or assigned leads/calls.
      if (client.role === 'manager' || client.userId === payload.userId) {
        try {
          client.res.write(data);
        } catch (e) {
          // Client disconnected
        }
      }
    });
  }
}
