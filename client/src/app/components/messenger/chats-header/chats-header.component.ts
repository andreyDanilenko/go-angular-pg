import { Component, Output, EventEmitter, Input } from '@angular/core';
@Component({
  selector: 'app-chats-header',
  standalone: true,
  templateUrl: './chats-header.component.html',
  styleUrls: ['./chats-header.component.css']
})
export class ChatsHeaderComponent {
  @Input() title: string = 'Чаты';
  @Output() burgerClick = new EventEmitter<void>();

  onBurgerClick() {
    this.burgerClick.emit();
  }
}
