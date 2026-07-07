import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface ChatResponse {
  reply: string;
  sources: { name: string; score: string }[];
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = environment.apiUrl;

  async sendMessage(message: string): Promise<ChatResponse> {
    const res = await fetch(`${this.apiUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erreur serveur' }));
      throw new Error(err.error || 'Erreur inconnue');
    }
    return res.json();
  }
}
