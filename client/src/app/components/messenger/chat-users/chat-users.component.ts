import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '../../../core/types/user.model';

@Component({
  selector: 'app-chat-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-users.component.html',
  styleUrls: ['./chat-users.component.css']
})
export class ChatUsersComponent {
  @Input() users: User[] = [];
  @Input() currentUser: User | null = null;

  @Output() userSelected = new EventEmitter<User>();

  get filteredUsers(): User[] {
    if (!this.currentUser) {
      return this.users;
    }
    return this.users.filter(user => user.id !== this.currentUser?.id);
  }

  onUserClick(user: User): void {
    this.userSelected.emit(user);
  }

  getUserName(user: User): string {
    if (user.first_name || user.last_name) {
      return `${user.last_name ?? ''} ${user.first_name ?? ''}`.trim();
    }
    return user.username || user.email;
  }

  getUserInitials(user: User): string {
    const parts: string[] = [];
    if (user.first_name) parts.push(user.first_name[0]);
    if (user.last_name) parts.push(user.last_name[0]);

    if (parts.length === 0 && user.username) {
      parts.push(user.username[0]);
    }
    if (parts.length === 0 && user.email) {
      parts.push(user.email[0]);
    }

    return parts.join('').toUpperCase();
  }

  getUserStatus(user: User): string {
    switch (user.role) {
      case 'admin':
        return 'Администратор';
      case 'user':
        return 'Пользователь';
      default:
        return 'Гость';
    }
  }
}

