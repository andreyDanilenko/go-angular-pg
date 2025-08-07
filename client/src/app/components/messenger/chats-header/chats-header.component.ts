import { Component, Output, EventEmitter, Input } from '@angular/core';
import { TooltipComponent } from '../../uikit/tooltip/tooltip.component';
import { User } from '../../../core/types/user.model';
@Component({
  selector: 'app-chats-header',
  standalone: true,
  imports: [TooltipComponent],
  templateUrl: './chats-header.component.html',
  styleUrls: ['./chats-header.component.css']
})
export class ChatsHeaderComponent {
  @Input() users: User[] = [];
  @Output() burgerClick = new EventEmitter<void>();
  @Output() editClick = new EventEmitter<string>();

  onBurgerClick() {
    this.burgerClick.emit();
  }

  createAdminChat(adminId: string) {
    this.editClick.emit(adminId);
  }
}
