import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChatService, ChatResponse } from '../services/chat.service';

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

  private chatService = new ChatService();

  async send() {
    const text = this.userInput().trim();
    if (!text || this.loading()) return;

    this.userInput.set('');
    this.error.set('');

    this.messages.update(msgs => [...msgs, { role: 'user', content: text }]);
    this.loading.set(true);

    try {
      const response: ChatResponse = await this.chatService.sendMessage(text);
      this.messages.update(msgs => [
        ...msgs,
        { role: 'assistant', content: response.reply, sources: response.sources },
      ]);
    } catch (err: any) {
      this.error.set(err.message || 'Impossible de contacter le serveur.');
    } finally {
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
