import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

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

  editOptions = [
    { id: 4, name: 'Чаты', icon: 'forum' }
  ];

  onBackClick(): void {
    this.backToChats.emit();
  }

  onEditOptionSelected(option: any): void {
    switch (option.icon) {
      case 'forum':
        return this.backToChats.emit();
      default:
        return this.backToChats.emit();
    }
  }
}
