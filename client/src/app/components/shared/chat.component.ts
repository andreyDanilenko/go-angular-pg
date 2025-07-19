import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebSocketService, ChatMessage } from '../../core/services/web-socket-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width: 600px; margin: auto; padding: 1rem;">
      <h2>WebSocket Chat</h2>

      <div>
        <label>
          To User ID:
          <input [(ngModel)]="toUserID" placeholder="UserID to send message" />
        </label>
      </div>

      <div>
        <input [(ngModel)]="inputMessage" placeholder="Type a message" (keydown.enter)="sendMessage()" />
        <button (click)="sendMessage()">Send</button>
      </div>

      <div style="margin-top: 1rem; border: 1px solid #ccc; padding: 0.5rem; height: 300px; overflow-y: auto;">
        <div *ngFor="let msg of messages" [style.textAlign]="msg.fromID === myUserID ? 'right' : 'left'">
          <small>{{ msg.fromID === myUserID ? 'You' : msg.fromID }}:</small>
          <div>{{ msg.data }}</div>
        </div>
      </div>
    </div>
  `
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: ChatMessage[] = [];
  inputMessage = '';
  toUserID = ''; // куда отправлять
  myUserID = ''; // твой UserID, должен прийти из backend или JWT токена

  private messageSubscription: Subscription | null = null;

  constructor(private webSocketService: WebSocketService) {}

  ngOnInit() {
    // TODO: получить myUserID из какого-то сервиса / контекста / токена
    this.myUserID = 'kDPnOhD5tUE3'; // заглушка, например

    this.messageSubscription = this.webSocketService.getMessages().subscribe(
      (msg) => {
        this.messages.push(msg);
      },
      (error) => {
        console.error('WebSocket error:', error);
      }
    );
  }

  sendMessage() {
    if (!this.inputMessage.trim() || !this.toUserID.trim()) return;

    const message: ChatMessage = {
      type: 'message',
      data: this.inputMessage.trim(),
      toID: this.toUserID.trim(),
      fromID: this.myUserID, // отправитель (хотя сервер добавит сам)
    };

    // Добавляем сообщение локально, чтобы сразу видеть его в UI
    this.messages.push(message);

    this.webSocketService.sendMessage(message);
    this.inputMessage = '';
  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    this.webSocketService.closeConnection();
  }
}
