import { Component } from '@angular/core';
import { ChatsComponent } from '../../components/messenger/chats/chats.component';
import { ChatComponent } from "../../components/messenger/chat/chat.component";
import { ChatPlaceholderComponent } from '../../components/messenger/chat/chat-placeholder.component';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [ChatsComponent, ChatComponent, ChatPlaceholderComponent],
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.css'
})
export class MessengerPageComponent {
  selectedChatId: string | null = null;

  onChatSelected(chatId: string) {
    console.log('chatId', chatId);

    this.selectedChatId = chatId;
  }
}
