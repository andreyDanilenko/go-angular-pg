import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
  lastMessage?: string; // Добавил как опциональное поле
  time?: string;        // Добавил как опциональное поле
  avatar?: string;      // Добавил как опциональное поле
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

  // Метод для генерации имени чата, если name пустое
  getChatName(chat: Chat): string {
    if (chat.name) return chat.name;
    return chat.participants.map(p => p.firstName || p.username).join(' & ');
  }

  // constructor() {
  //   this.search.valueChanges
  //     .pipe(
  //       debounceTime(300), // Задержка 300мс перед обработкой
  //       distinctUntilChanged() // Игнорировать повторяющиеся значения
  //     )
  //     .subscribe(searchTerm => {
  //       this.filterChats(searchTerm || '');
  //     });
  // }

  // private filterChats(searchTerm: string) {
  //   if (!searchTerm.trim()) {
  //     this.filteredChats.set(this.allChats());
  //     return;
  //   }

  //   const filtered = this.allChats().filter(chat =>
  //     chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  //   );

  //   this.filteredChats.set(filtered);
  // }
}
