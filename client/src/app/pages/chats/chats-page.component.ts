import { Component } from '@angular/core';
import { ChatsComponent } from '../../components/messenger/chats/chats.component';

@Component({
  selector: 'app-chats-page',
  standalone: true,
  imports: [ChatsComponent],
  templateUrl: './chats-page.component.html',
  styleUrl: './chats-page.component.scss'
})
export class ChatsPageComponent {

}
