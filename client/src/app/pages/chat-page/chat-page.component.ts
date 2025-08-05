import { Component } from '@angular/core';
import { ChatsComponent } from '../../components/messenger/chats/chats.component';
import { ChatComponent } from "../../components/messenger/chat/chat.component";

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [ChatsComponent, ChatComponent],
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.css'
})
export class MessengerPageComponent {

}
