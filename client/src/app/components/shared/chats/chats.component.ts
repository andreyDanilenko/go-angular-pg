import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { InputComponent } from '../../uikit/input/input.component';

interface Participant {
  id: string;
  username: string;
  firstName: string;
  email: string;
  role: string;
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


@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, InputComponent],
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.css']
})
export class ChatsComponent {
  search = new FormControl('');

  protected readonly allChats = signal<Chat[]>([
    {
      id: 'GELpvhL37eTT',
      name: 'Andrey1 & Andrey2',
      isGroup: false,
      createdAt: '2025-07-22T18:17:11.29512Z',
      updatedAt: '2025-07-22T18:17:11.29512Z',
      participants: [
        {
          id: '8nVwiNQ8pI84',
          username: 'Andrey1',
          firstName: 'Andrey',
          email: 'danilenko1@mail.ru',
          role: 'guest',
          createdAt: '2025-07-22T18:16:06.459126Z',
          updatedAt: '2025-07-22T18:16:06.459126Z'
        },
        {
          id: 'aRjJGSivRWXL',
          username: 'Andrey2',
          firstName: 'Andrey',
          email: 'danilenko2@mail.ru',
          role: 'guest',
          createdAt: '2025-07-22T18:16:27.785264Z',
          updatedAt: '2025-07-22T18:16:27.785264Z'
        }
      ],
      unreadCount: 4,
      lastMessage: 'Привет! Как насчет встречи завтра?',
      time: '18:17',
      avatar: 'assets/avatars/default-user.jpg'
    },
    {
      id: '2',
      name: 'Мария Петрова',
      isGroup: false,
      createdAt: '2025-07-22T10:00:00.000Z',
      updatedAt: '2025-07-22T10:00:00.000Z',
      participants: [],
      unreadCount: 0,
      lastMessage: 'Я отправила тебе документы по проекту',
      time: '15:30',
      avatar: 'assets/avatars/2.jpg'
    }
  ]);

  getChatName(chat: Chat): string {
    if (chat.name) return chat.name;
    return chat.participants.map(p => p.firstName || p.username).join(' & ');
  }
}
