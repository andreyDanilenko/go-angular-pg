import { Component, Output, EventEmitter } from '@angular/core';
import { TooltipComponent } from '../../uikit/tooltip/tooltip.component';
@Component({
  selector: 'app-chats-header',
  standalone: true,
  imports: [TooltipComponent],
  templateUrl: './chats-header.component.html',
  styleUrls: ['./chats-header.component.css']
})
export class ChatsHeaderComponent {
  @Output() burgerClick = new EventEmitter<void>();
  @Output() editClick = new EventEmitter<void>();

  onBurgerClick() {
    this.burgerClick.emit();
  }

  createAdminChat() {
    this.editClick.emit();
    console.log('123');
  }
}
