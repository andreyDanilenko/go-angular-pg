import { Component, HostListener } from '@angular/core';
import { ChatsComponent } from '../../components/messenger/chats/chats.component';
import { ChatComponent } from "../../components/messenger/chat/chat.component";
import { ChatPlaceholderComponent } from '../../components/messenger/chat/chat-placeholder.component';
import { UserStore } from '../../stores/user-store/user.store';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/types/user.model';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [ChatsComponent, ChatComponent, ChatPlaceholderComponent],
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.css'
})
export class MessengerPageComponent {
  selectedChatId: string | null = null;
  currentUser: User | null = null;

  onChatSelected(chatId: string) {
    this.selectedChatId = chatId;
  }

  constructor(
    private userStore: UserStore,
  ) {}

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    this.selectedChatId = null;
  }

  ngOnInit(): void {
    this.userStore.state$.subscribe(state => {
      this.currentUser = state.currentUser;
    });
  }

  get displayName(): string {
    if (!this.currentUser) return '';
    if (this.currentUser.firstName && this.currentUser.lastName) {
      return `${this.currentUser.lastName} ${this.currentUser.firstName}`;
    }

    return `${this.currentUser.email}`;
  }

}
