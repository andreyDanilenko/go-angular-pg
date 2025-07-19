import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { Observable } from 'rxjs';

export interface ChatMessage {
  type: string;
  data: string;
  toID: string;
  fromID?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocketSubject<ChatMessage>;
  private readonly url = 'ws://localhost:8081/api/ws';

  constructor() {
    // Использование proxy: '/api/ws' (без хоста)
    this.socket$ = webSocket<ChatMessage>('ws://localhost:8081/api/ws');
  }

  sendMessage(message: ChatMessage) {
    this.socket$.next(message);
  }

  getMessages(): Observable<ChatMessage> {
    return this.socket$.asObservable();
  }

  closeConnection() {
    this.socket$.complete();
  }
}
