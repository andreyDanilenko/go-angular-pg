import { Injectable } from '@angular/core';
import { filter, Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment.prod';

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
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;
  console.log('Current environment:', environment);

    const wsUrl = `${environment.socketUrl}/ws?token=${this.token}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      this.connectionSubject.next(true);
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log(message);
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
      const message = { chatId, text };
      console.log('Sending message:', message);
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not open.');
    }
  }

  getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  getChatMessages(chatId: string): Observable<any> {
    return this.messageSubject.asObservable().pipe(
      filter(message => message.payload?.chatId === chatId)
    );
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
