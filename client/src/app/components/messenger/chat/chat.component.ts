import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, Input, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../../../core/services/web-socket-service.service';
import { environment } from '../../../../environments/environment.prod';
import { UserStore } from '../../../stores/user-store/user.store';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() chatId: string | null = null;

  messages: any[] = [];
  newMessage = new FormControl('');
  currentUserId: string | null = null;
  isConnected = false;

  private messageSubscription!: Subscription;
  private connectionSubscription!: Subscription;
  private userStoreSubscription!: Subscription;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  private shouldScroll = false;

  constructor(
    private wsService: WebSocketService,
    private http: HttpClient,
    private userStore: UserStore,
  ) {}


  ngOnInit(): void {
        console.log('4545');

    this.userStoreSubscription = this.userStore.state$.subscribe(state => {
      this.currentUserId = state.currentUser?.id || "";
    });

    this.connectionSubscription = this.wsService.getConnectionStatus().subscribe({
      next: (connected: boolean) => {
        this.isConnected = connected;
        if (connected && this.chatId) {
          this.loadChatHistory();
          this.subscribeToMessages();
        }
      },
      error: (error) => console.error('Connection error:', error)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('123');

    if (changes['chatId'] && changes['chatId'].currentValue !== changes['chatId'].previousValue) {
      console.log('update');

      this.resetChat();
      if (this.isConnected && this.chatId) {
        this.loadChatHistory();
        this.subscribeToMessages();
      }
    }
  }

  private resetChat(): void {
    this.messages = [];
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  private subscribeToMessages(): void {
    if (!this.chatId) return;
    this.messageSubscription = this.wsService.getChatMessages(this.chatId).subscribe({
      next: (message: any) => {
        const exists = this.messages.some(m => m.id === message.payload.id);

        if (!exists) {
          this.messages.push(message.payload);
          this.sortMessages();
          this.shouldScroll = true;
        }
      },
      error: (error: any) => {
        console.error('Error receiving message:', error);
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.messagesContainer?.nativeElement) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    try {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    } catch(err) {
      console.error('Scroll error:', err);
    }
  }

  ngOnDestroy(): void {
    this.userStoreSubscription?.unsubscribe();
    this.connectionSubscription?.unsubscribe();
    this.messageSubscription?.unsubscribe();
  }

  sendMessage(): void {
    if (!this.chatId) return;
    const messageText = this.newMessage.value?.trim();
    if (messageText && this.isConnected) {
      this.wsService.sendMessage(this.chatId, messageText);
      this.newMessage.reset('');
    }
  }

  loadChatHistory(): void {
    if (!this.chatId) return;
    const baseUrl = `${environment.apiUrl}/chat/messages?chatId=${this.chatId}&offsets=2`;

    this.http.get<any[]>(baseUrl).subscribe({
      next: (history: any[]) => {
        this.messages = history.reverse();
        this.sortMessages();
        this.shouldScroll = true;
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
    this.shouldScroll = true;
  }
}
