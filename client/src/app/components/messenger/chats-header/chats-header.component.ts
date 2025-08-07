import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-chats-header',
  standalone: true,
  templateUrl: './chats-header.component.html',
  styleUrls: ['./chats-header.component.css']
})
export class ChatsHeaderComponent {
  @Output() burgerClick = new EventEmitter<void>();
  @Output() editClick = new EventEmitter<void>();

  onBurgerClick() {
    console.log('Бургер нажат');
    this.burgerClick.emit();
  }

  onEditClick() {
    console.log('Редактировать чат');
    this.editClick.emit();
  }
}
