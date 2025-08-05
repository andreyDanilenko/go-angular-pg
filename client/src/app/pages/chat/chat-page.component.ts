import { Component } from '@angular/core';
import { ChatComponent } from '../../components/messenger/chat/chat.component';

@Component({
  selector: 'app-chat-page',
  imports: [ChatComponent],
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.css'
})
export class ChatPageComponent {

}
