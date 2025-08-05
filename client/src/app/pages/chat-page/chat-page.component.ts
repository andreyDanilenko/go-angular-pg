import { Component } from '@angular/core';
import { ChatsComponent } from '../../components/shared/chats/chats.component';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [ChatsComponent],
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.css'
})
export class MessengerPageComponent {

}
