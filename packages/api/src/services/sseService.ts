import type { Response } from 'express';
import { getDb } from '../db/client.js';
import { logger } from '../logger.js';

interface SseClient {
  id: string;
  res: Response;
}

class SseService {
  private clients = new Map<string, SseClient>();
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private lastPolledId = 0;

  addClient(id: string, res: Response): void {
    // SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': 'http://localhost:4010',
      'X-Accel-Buffering': 'no',
    });

    this.clients.set(id, { id, res });
    logger.debug({ clientId: id, total: this.clients.size }, 'SSE client connected');

    // Send initial connection event
    this.sendToClient(id, 'connected', { clientId: id, timestamp: Date.now() });
  }

  removeClient(id: string): void {
    this.clients.delete(id);
    logger.debug({ clientId: id, total: this.clients.size }, 'SSE client disconnected');
  }

  start(): void {
    // Poll sse_queue every 5 seconds
    this.pollInterval = setInterval(() => this.pollAndBroadcast(), 5000);

    // Heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      this.broadcast('heartbeat', { ts: Date.now() });
    }, 30_000);

    // Get the last sent ID to start from
    try {
      const last = getDb()
        .prepare('SELECT MAX(id) as maxId FROM sse_queue WHERE sent = 1')
        .get() as { maxId: number | null };
      this.lastPolledId = last.maxId ?? 0;
    } catch {
      this.lastPolledId = 0;
    }

    logger.info('SSE service started');
  }

  stop(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    for (const client of this.clients.values()) {
      client.res.end();
    }
    this.clients.clear();
  }

  private pollAndBroadcast(): void {
    if (this.clients.size === 0) return;

    try {
      const db = getDb();
      const rows = db.prepare(`
        SELECT id, event_type, payload FROM sse_queue
        WHERE id > ? AND sent = 0
        ORDER BY id ASC
        LIMIT 50
      `).all(this.lastPolledId) as Array<{ id: number; event_type: string; payload: string }>;

      if (rows.length === 0) return;

      for (const row of rows) {
        try {
          const payload = JSON.parse(row.payload);
          this.broadcast(row.event_type, payload);
          this.lastPolledId = row.id;
        } catch {
          // skip malformed payloads
        }
      }

      // Mark as sent
      db.prepare(`
        UPDATE sse_queue SET sent = 1 WHERE id <= ?
      `).run(this.lastPolledId);
    } catch (err) {
      logger.error({ err }, 'SSE poll error');
    }
  }

  private broadcast(eventType: string, data: unknown): void {
    const deadClients: string[] = [];

    for (const client of this.clients.values()) {
      try {
        this.sendToClient(client.id, eventType, data);
      } catch {
        deadClients.push(client.id);
      }
    }

    for (const id of deadClients) {
      this.removeClient(id);
    }
  }

  private sendToClient(clientId: string, eventType: string, data: unknown): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    client.res.write(payload);
  }

  get clientCount(): number {
    return this.clients.size;
  }
}

export const sseService = new SseService();
