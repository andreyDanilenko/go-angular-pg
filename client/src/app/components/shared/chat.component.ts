import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../core/services/web-socket-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service'; // Добавлен импорт AuthService

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
  currentChatId = '1'; // ID текущего чата
  currentUserId: string | null = null; // Добавлено свойство для ID текущего пользователя
  isConnected = false;
  private messageSubscription!: Subscription;
  private connectionSubscription!: Subscription;

  constructor(
    private wsService: WebSocketService,
    private authService: AuthService // Добавлен AuthService
  ) {}

  ngOnInit(): void {
    // Получаем ID текущего пользователя из токена
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
        this.messages.push(message);
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
    console.log('Loading chat history...');
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
