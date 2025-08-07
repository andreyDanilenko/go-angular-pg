import { Component } from '@angular/core';

@Component({
  selector: 'app-chats-header',
  standalone: true,
  templateUrl: './chats-header.component.html',
  styleUrls: ['./chats-header.component.css']
})
export class ChatsHeaderComponent {
  // Можно добавить обработчики кликов
  onBurgerClick() {
    console.log('Бургер нажат');
  }

  onEditClick() {
    console.log('Редактировать чат');
  }
}
