import { Component, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  avatar: string;
}

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.css']
})
export class ChatsComponent {
  protected readonly chats: Signal<Chat[]> = signal([
    {
      id: '1',
      name: 'Алексей Иванов',
      lastMessage: 'Привет, как дела?',
      time: '12:30',
      unreadCount: 2,
      avatar: 'assets/avatars/1.jpg'
    },
    {
      id: '2',
      name: 'Мария Петрова',
      lastMessage: 'Отправила тебе документы',
      time: '10:45',
      unreadCount: 0,
      avatar: 'assets/avatars/2.jpg'
    },
    {
      id: '3',
      name: 'Иван Сидоров',
      lastMessage: 'Давай встретимся завтра',
      time: 'Вчера',
      unreadCount: 5,
      avatar: 'assets/avatars/3.jpg'
    },
    {
      id: '4',
      name: 'Ольга Николаева',
      lastMessage: 'Спасибо за помощь!',
      time: 'Понедельник',
      unreadCount: 0,
      avatar: 'assets/avatars/4.jpg'
    },
  ]);
}
