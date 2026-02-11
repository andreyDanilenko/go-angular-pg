import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { User } from '../../../core/types/user.model';

@Component({
  selector: 'app-chats-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './chats-edit.component.html',
  styleUrls: ['./chats-edit.component.css']
})
export class ChatsEditComponent {
  @Output() backToChats = new EventEmitter<void>();
  @Output() openUsers = new EventEmitter<void>();
  @Output() createChat = new EventEmitter<string>();

  @Input() users: User[] = [];
  @Input() currentUser: User | null = null;

  editOptions = [
    { id: 1, name: 'Чаты', icon: 'chats' },
    { id: 2, name: 'Пользователи', icon: 'users' },
  ];

  onBackClick(): void {
    this.backToChats.emit();
  }

  onEditOptionSelected(option: any): void {
    switch (option.icon) {
      case 'chats':
        this.backToChats.emit();
        break;
      case 'users':
        this.openUsers.emit();
        break;
    }
  }

  onUserSelected(user: User): void {
    this.createChat.emit(user.id);
  }
}
