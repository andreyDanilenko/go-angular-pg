import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { InputComponent } from '../../uikit/input/input.component';
import { catchError, of } from 'rxjs';
import { BaseApiService } from '../../../core/services/base-api.service';

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
  // Дополнительные необязательные поля из вашего примера
  lastMessage?: string;
  time?: string;
  avatar?: string;
}

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, InputComponent],
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.css']
})
export class ChatsComponent implements OnInit {
  search = new FormControl('');

  protected readonly allChats = signal<Chat[]>([]);
  protected loading = signal(true);
  protected error = signal<string | null>(null);

  constructor(private apiService: BaseApiService) {}

  ngOnInit(): void {
    this.loadChats();
  }

  loadChats(): void {
    this.loading.set(true);
    this.error.set(null);

    this.apiService.get<Chat[]>('chat/user-chats') // предполагается, что endpoint называется 'chats'
      .pipe(
        catchError(err => {
          console.error('Failed to load chats', err);
          this.error.set('Failed to load chats. Please try again later.');
          return of([]); // возвращаем пустой массив в случае ошибки
        })
      )
      .subscribe(chats => {
        this.allChats.set(this.processChats(chats));
        this.loading.set(false);
      });
  }

  private processChats(chats: Chat[]): Chat[] {
    return chats.map(chat => ({
      ...chat,
      // Добавляем недостающие поля, если их нет в ответе API
      lastMessage: chat.lastMessage || '',
      time: chat.time || this.formatTime(chat.updatedAt),
      avatar: chat.avatar || 'assets/avatars/default-user.jpg'
    }));
  }

  private formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getChatName(chat: Chat): string {
    if (chat.name) return chat.name;
    return chat.participants.map(p => p.firstName || p.username).join(' & ');
  }
}
