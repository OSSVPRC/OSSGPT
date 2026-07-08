import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChatService } from '../services/chat.service';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: { name: string; score: string }[];
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class ChatComponent {
  protected readonly messages = signal<Message[]>([]);
  protected readonly userInput = signal('');
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly status = signal('');
  protected readonly hasFirstToken = signal(false);

  private chatService = new ChatService();

  async send() {
    const text = this.userInput().trim();
    if (!text || this.loading()) return;

    this.userInput.set('');
    this.error.set('');
    this.status.set('');
    this.hasFirstToken.set(false);

    this.messages.update(msgs => [...msgs, { role: 'user', content: text }]);
    this.loading.set(true);

    let sources: { name: string; score: string }[] = [];

    try {
      await this.chatService.sendMessageStream(text, {
        onToken: (token) => {
          if (!this.hasFirstToken()) {
            this.hasFirstToken.set(true);
            this.status.set('Génération de la réponse...');
            this.messages.update(msgs => [...msgs, { role: 'assistant', content: '' }]);
          }
          this.messages.update(msgs => {
            const updated = [...msgs];
            const last = { ...updated[updated.length - 1] };
            last.content += token;
            updated[updated.length - 1] = last;
            return updated;
          });
        },
        onSources: (srcs) => {
          sources = srcs;
          this.status.set('Analyse en cours...');
        },
        onDone: (reply, srcs) => {
          this.status.set('');
          this.messages.update(msgs => {
            const updated = [...msgs];
            updated[updated.length - 1] = { role: 'assistant', content: reply, sources: srcs };
            return updated;
          });
          this.loading.set(false);
        },
        onError: (errMsg) => {
          this.status.set('');
          this.error.set(errMsg);
          this.loading.set(false);
        },
      });
    } catch (err: any) {
      this.status.set('');
      this.error.set(err.message || 'Impossible de contacter le serveur.');
      this.loading.set(false);
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }
}
