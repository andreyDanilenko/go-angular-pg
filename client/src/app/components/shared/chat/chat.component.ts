// src/app/features/chat/chat.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { WebSocketService } from '../../../core/services/web-socket-service.service';
import { environment } from '../../../../environments/environment.prod';

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
  currentChatId = 'GELpvhL37eTT';
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

        console.log('message', message);

        if (!exists) {
          this.messages.push(message.payload);
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
    const baseUrl = `${environment.apiUrl}/chat/messages?chatId=${this.currentChatId}&offsets=2`;

    this.http.get<any[]>(baseUrl)
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
