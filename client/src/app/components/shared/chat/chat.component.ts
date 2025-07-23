// src/app/features/chat/chat.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { WebSocketService } from '../../../core/services/web-socket-service.service';
import { environment } from '../../../../environments/environment.prod';
import { InputComponent } from '../../uikit/input/input.component';
import { ButtonComponent } from '../../uikit/button/button.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputComponent,
    ButtonComponent
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: any[] = [];
  newMessage = new FormControl('');
  currentChatId: string | null = null;
  currentUserId: string | null = null;
  isConnected = false;

  private messageSubscription!: Subscription;
  private connectionSubscription!: Subscription;

  constructor(
    private wsService: WebSocketService,
    private authService: AuthService,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe({
      next: (params) => {
        //@ts-ignore
        this.currentChatId = params['params'].id;

        if (!this.currentChatId) {
          console.error('Chat ID not found in URL');
          return;
        }

        this.currentUserId = this.getUserIdFromToken();
        this.wsService.connect();

        this.connectionSubscription = this.wsService.getConnectionStatus().subscribe({
          next: (connected: boolean) => {
            this.isConnected = connected;
            if (connected) {
              this.loadChatHistory();
            }
          },
          error: (error) => console.error('Connection error:', error)
        });

        this.messageSubscription = this.wsService.getMessages().subscribe({
          next: (message: any) => {
            const exists = this.messages.some(m => m.id === message.id);

            if (!exists) {
              this.messages.push(message.payload);
              this.sortMessages();
            }
          },
          error: (error: any) => {
            console.error('Error receiving message:', error);
          }
        });
      },
      error: (error) => console.error('Route param error:', error)
    });
  }

  ngOnDestroy(): void {
    this.messageSubscription?.unsubscribe();
    this.connectionSubscription?.unsubscribe();
    this.wsService.disconnect();
  }

  sendMessage(): void {
    if (!this.currentChatId) return;

    const messageText = this.newMessage.value?.trim();
    if (messageText && this.isConnected) {
      this.wsService.sendMessage(this.currentChatId, messageText);
      this.newMessage.reset('');
    }
  }

  loadChatHistory(): void {
    if (!this.currentChatId) return;

    const baseUrl = `${environment.apiUrl}/chat/messages?chatId=${this.currentChatId}&offsets=2`;

    this.http.get<any[]>(baseUrl).subscribe({
      next: (history: any[]) => {
        this.messages = history;
        this.sortMessages();
      },
      error: (error) => {
        console.error('Failed to load chat history', error);
      }
    });
  }

  private sortMessages(): void {
    this.messages.sort((a, b) =>
      new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
    );
  }

  private getUserIdFromToken(): string | null {
    const token = this.authService.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.userId || null;
    } catch (e) {
      console.error('Error parsing token:', e);
      return null;
    }
  }
}
