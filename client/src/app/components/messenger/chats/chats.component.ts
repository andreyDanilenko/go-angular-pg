import { Component, signal, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { catchError, of, Subscription } from 'rxjs';
import { BaseApiService } from '../../../core/services/base-api.service';
import { WebSocketService } from '../../../core/services/web-socket-service.service';

interface Participant {
  id: string;
  username: string;
  firstName: string;
  email: string;
  role: 'guest' | 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

interface Chat {
  id: string;
  name: string;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
  participants: Participant[];
  unreadCount: number;
  lastMessage?: string;
  time?: string;
  avatar?: string;
}

interface SocketMessage {
  type: string;
  payload: any;
}

interface MessagePayload {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  sentAt: string;
  sender: Participant;
  isRead: boolean;
}

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.css'],
  providers: [BaseApiService]
})
export class ChatsComponent implements OnInit {
  @Output() chatSelected = new EventEmitter<string>();
  search = new FormControl('');
  currentChatId: string | null = null;

  private wsSubscription!: Subscription;

  protected readonly allChats = signal<Chat[]>([]);
  protected loading = signal(true);
  protected error = signal<string | null>(null);

  constructor(
    private apiService: BaseApiService,
    private wsService: WebSocketService
  ) {}

  selectChat(chatId: string) {
    this.currentChatId = chatId;
    this.chatSelected.emit(chatId);
  }
  ngOnInit(): void {
    this.loadChats();
    this.initWebSocket()
  }

  private loadChats(): void {
    this.loading.set(true);
    this.error.set(null);

    this.apiService.get<Chat[]>('chat/user-chats')
      .pipe(
        catchError(err => {
          console.error('Failed to load chats', err);
          this.error.set('Не удалось загрузить чаты. Пожалуйста, попробуйте позже.');
          return of([]);
        })
      )
      .subscribe(chats => {
        this.allChats.set(this.processChats(chats));
        this.loading.set(false);
      });
  }

  private initWebSocket(): void {
    this.wsSubscription = this.wsService.getMessages().subscribe({
      next: (message) => this.handleSocketMessage(message),
      error: (err) => console.error('WebSocket error:', err)
    });
  }

  private handleSocketMessage(message: SocketMessage): void {
    try {
      switch (message.type) {
        case 'message':
          this.handleNewMessage(message.payload as MessagePayload);
          break;

        case 'chat_updated':
          this.handleChatUpdate(message.payload);
          break;

        case 'message_read':
          this.handleMessageRead(message.payload);
          break;

        default:
          console.warn(`Unhandled message type: ${message.type}`, message);
          break;
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error, message);
    }
  }

  private handleNewMessage(payload: MessagePayload): void {
    this.allChats.update(chats => {
      const updatedChats = chats.map(chat => {
        if (chat.id === payload.chatId) {
          return {
            ...chat,
            lastMessage: this.formatLastMessage(payload),
            time: this.formatTime(payload.sentAt),
            unreadCount: payload.isRead ? chat.unreadCount : chat.unreadCount + 1
          };
        }
        return chat;
      });

      return this.sortChatsByLastMessage(updatedChats);
    });
  }

  private formatLastMessage(payload: MessagePayload): string {
    const senderName = payload.sender.firstName || payload.sender.username;
    return `${senderName}: ${payload.text}`;
  }

  private handleChatUpdate(payload: any): void {
    // Пример обработки обновления чата
    this.allChats.update(chats =>
      chats.map(chat =>
        chat.id === payload.chatId ? { ...chat, ...payload.chatData } : chat
      )
    );
  }

  private handleMessageRead(payload: { chatId: string, readCount: number }): void {
    this.allChats.update(chats =>
      chats.map(chat =>
        chat.id === payload.chatId
          ? { ...chat, unreadCount: Math.max(0, chat.unreadCount - payload.readCount) }
          : chat
      )
    );
  }

  private processChats(chats: Chat[]): Chat[] {
    return chats.map(chat => ({
      ...chat,
      lastMessage: chat.lastMessage || '',
      time: chat.time || this.formatTime(chat.updatedAt),
    })).sort((a, b) => {
      const dateA = a.time ? new Date(a.time).getTime() : new Date(a.updatedAt).getTime();
      const dateB = b.time ? new Date(b.time).getTime() : new Date(b.updatedAt).getTime();
      return dateB - dateA;
    });
  }

  private sortChatsByLastMessage(chats: Chat[]): Chat[] {
    return [...chats].sort((a, b) => {
      const dateA = a.time ? new Date(a.time).getTime() : new Date(a.updatedAt).getTime();
      const dateB = b.time ? new Date(b.time).getTime() : new Date(b.updatedAt).getTime();
      return dateB - dateA;
    });
  }

  public formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getChatName(chat: Chat): string {
    if (chat.name) return chat.name;
    return chat.participants
      .map(p => p.firstName || p.username)
      .join(', ');
  }

  trackByChatId(index: number, chat: Chat): string {
    return chat.id;
  }
}
