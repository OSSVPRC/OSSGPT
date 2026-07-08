import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

export interface ChatResponse {
  reply: string;
  sources: { name: string; score: string }[];
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onSources: (sources: { name: string; score: string }[]) => void;
  onDone: (reply: string, sources: { name: string; score: string }[]) => void;
  onError: (error: string) => void;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = environment.apiUrl;

  async sendMessage(message: string): Promise<ChatResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);
    try {
      const res = await fetch(`${this.apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erreur serveur' }));
        throw new Error(err.error || 'Erreur inconnue');
      }
      return res.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  async sendMessageStream(message: string, callbacks: StreamCallbacks) {
    const { onToken, onSources, onDone, onError } = callbacks;
    try {
      const res = await fetch(`${this.apiUrl}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erreur serveur' }));
        onError(err.error || 'Erreur inconnue');
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        onError('Stream non disponible');
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let fullReply = '';
      let sources: { name: string; score: string }[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.type === 'token') {
                fullReply += data.token;
                onToken(data.token);
              } else if (data.type === 'sources') {
                sources = data.sources;
                onSources(sources);
              } else if (data.type === 'done') {
                onDone(data.reply, data.sources);
              } else if (data.type === 'error') {
                onError(data.error);
              }
            } catch { /* skip */ }
          }
        }
      }
    } catch (err: any) {
      onError(err.message || 'Erreur de connexion');
    }
  }
}
