import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, Input, HostListener, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { WebSocketService } from '../../../core/services/web-socket-service.service';
import { environment } from '../../../../environments/environment.prod';
import { ActivatedRoute } from '@angular/router';
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
  // providers: [],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() set chatId(value: string | null) {
    if (value) {
      this.currentChatId = value;
      this.loadChatHistory();
    }
  }
  messages: any[] = [];
  newMessage = new FormControl('');
  currentChatId: string | null = null;
  currentUserId: string | null = null;
  isConnected = false;

  private messageSubscription!: Subscription;
  private connectionSubscription!: Subscription;
  private userStoreSubscription!: Subscription;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  private shouldScroll = false;

  constructor(
    private wsService: WebSocketService,
    private authService: AuthService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private userStore: UserStore,
  ) {}


  ngOnInit(): void {
    this.userStoreSubscription = this.userStore.state$.subscribe(state => {
      this.currentUserId = state.currentUser?.id || "";
    });

    this.connectionSubscription = this.wsService.getConnectionStatus().subscribe({
      next: (connected: boolean) => {
        console.log(connected);

        this.isConnected = connected;
        if (connected && this.currentChatId) {
          this.loadChatHistory();
          this.subscribeToMessages();
        }
      },
      error: (error) => console.error('Connection error:', error)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('1231231231321');

    if (changes['chatId'] && changes['chatId'].currentValue) {
      this.resetChat();
      if (this.isConnected) {
        console.log('his.isConnected', this.isConnected);

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
    if (!this.currentChatId) return;
    this.messageSubscription = this.wsService.getChatMessages(this.currentChatId).subscribe({
      next: (message: any) => {
        console.log(this.messages);

        const exists = this.messages.some(m => m.id === message.payload.chatId);
        console.log('exists', exists);

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
    // this.messageSubscription?.unsubscribe();
    // this.connectionSubscription?.unsubscribe();
    this.userStoreSubscription?.unsubscribe();
    // this.wsService.disconnect();
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
