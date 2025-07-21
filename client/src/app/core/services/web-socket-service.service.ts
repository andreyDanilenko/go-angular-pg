// websocket.service.ts
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket!: WebSocket;
  private messageSubject = new Subject<any>();
  private connectionSubject = new Subject<boolean>();
  private token: string;

  constructor() {
    this.token = localStorage.getItem('auth_token') || '';
  }

  connect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = `ws://localhost:8081/api/ws?token=${this.token}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      this.connectionSubject.next(true);
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.messageSubject.next(message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.connectionSubject.next(false);
    };

    this.socket.onclose = () => {
      this.connectionSubject.next(false);
      setTimeout(() => this.connect(), 5000);
    };
  }

  sendMessage(chatId: string, text: string): void {
    if (this.socket.readyState === WebSocket.OPEN) {
      console.log({ "chatId": "jxpzcw8xfABH", "text": text});

      this.socket.send(JSON.stringify({ "chatId": "jxpzcw8xfABH", "text": text}));
    }
  }

  getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connectionSubject.asObservable();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}
