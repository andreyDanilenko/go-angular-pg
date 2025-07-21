// src/app/features/chat/chat.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../core/services/web-socket-service.service';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: any[] = [];
  newMessage = '';
  currentChatId = '2sJAN_wQuTDc';
  currentUserId: string | null = null;
  isConnected = false;

  private messageSubscription!: Subscription;
  private connectionSubscription!: Subscription;

  constructor(
    private wsService: WebSocketService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.getUserIdFromToken();

    this.wsService.connect();

    this.connectionSubscription = this.wsService.getConnectionStatus().subscribe(
      (connected: boolean) => {
        this.isConnected = connected;
        if (connected) {
          this.loadChatHistory();
        }
      }
    );

    this.messageSubscription = this.wsService.getMessages().subscribe(
      (message: any) => {
        const exists = this.messages.some(m => m.id === message.id);
        if (!exists) {
          this.messages.push(message);
          this.sortMessages();
        }
      },
      (error: any) => {
        console.error('Error receiving message:', error);
      }
    );
  }

  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
    this.connectionSubscription.unsubscribe();
    this.wsService.disconnect();
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.isConnected) {
      this.wsService.sendMessage(this.currentChatId, this.newMessage);
      this.newMessage = '';
    }
  }

  loadChatHistory(): void {
    const chatId = this.currentChatId;
    this.http.get<any[]>(`http://localhost:8081/api/chat/messages?chatId=${chatId}`)
      .subscribe(
        (history: any[]) => {
          this.messages = history;
          this.sortMessages();
        },
        (error) => {
          console.error('Failed to load chat history', error);
        }
      );
  }

  private sortMessages(): void {
    this.messages.sort((a, b) =>
      new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
    );
  }

  private getUserIdFromToken(): string | null {
    const token = this.authService.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.userId || null;
    } catch (e) {
      console.error('Error parsing token:', e);
      return null;
    }
  }
}
