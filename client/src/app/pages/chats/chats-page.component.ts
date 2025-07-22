import { Component } from '@angular/core';
import { ChatsComponent } from '../../components/shared/chats/chats.component';

@Component({
  selector: 'app-chats-page',
  standalone: true,
  imports: [ChatsComponent],
  templateUrl: './chats-page.component.html',
  styleUrl: './chats-page.component.css'
})
export class ChatsPage {

}
