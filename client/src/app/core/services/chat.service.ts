import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private api: BaseApiService) {}

  getUserChats(): Observable<any> {
    return this.api.get('chat/user-chats');
  }

  createPrivateChat(otherUserId: string): Observable<any> {
    return this.api.post('chat/create-private', { otherUserId });
  }

  getChatMessages(chatId: string, offset: number, limit: number): Observable<any> {
    const url = `chat/messages?chatId=${chatId}`;
    return this.api.get(url);
  }
}
