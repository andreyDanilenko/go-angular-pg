import { Component } from '@angular/core';

@Component({
  selector: 'app-chat-header',
  templateUrl: './chat-header.component.html',
  styleUrls: ['./chat-header.component.css']
})
export class ChatHeaderComponent {
  user = {
    name: 'Имя Фамилия',
    status: 'В сети',
    avatarUrl: 'https://placehold.co/48x48/e5e7eb/6b7280?text=И'
  };

  call() {
    console.log('Звонок');
  }

  videoCall() {
    console.log('Видеозвонок');
  }

  openProfile() {
    console.log('Открыть профиль');
  }
}
