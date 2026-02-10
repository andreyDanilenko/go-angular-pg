import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  Input,
  SimpleChanges,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../../../core/services/web-socket-service.service';
import { environment } from '../../../../environments/environment.prod';
import { UserStore } from '../../../stores/user-store/user.store';
import {
  ChatMessage,
  toChatMessage,
} from '../../../core/types/message.model';

/** Элемент ленты: дата или сообщение (для разделителей дат) */
export type MessageRow = { type: 'date'; date: string; label: string } | { type: 'message'; message: ChatMessage };

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() chatId: string | null = null;

  messages: ChatMessage[] = [];
  newMessage = new FormControl('');
  currentUserId: string | null = null;
  isConnected = false;

  /** Режим выбора сообщений (для пересылки, удаления и т.д.) */
  selectionMode = false;
  selectedIds = new Set<string>();

  private messageSubscription!: Subscription;
  private connectionSubscription!: Subscription;
  private userStoreSubscription!: Subscription;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  private shouldScroll = false;

  constructor(
    private wsService: WebSocketService,
    private http: HttpClient,
    private userStore: UserStore
  ) {}

  /** Лента с разделителями дат для отображения в шаблоне */
  get messageRows(): MessageRow[] {
    const rows: MessageRow[] = [];
    let lastDate = '';
    for (const msg of this.messages) {
      const d = this.getDateKey(msg.sentAt);
      if (d !== lastDate) {
        lastDate = d;
        rows.push({ type: 'date', date: d, label: this.formatDateLabel(d) });
      }
      rows.push({ type: 'message', message: msg });
    }
    return rows;
  }

  ngOnInit(): void {
    this.userStoreSubscription = this.userStore.state$.subscribe((state) => {
      this.currentUserId = state.currentUser?.id ?? '';
    });

    this.connectionSubscription = this.wsService.getConnectionStatus().subscribe({
      next: (connected: boolean) => {
        this.isConnected = connected;
        if (connected && this.chatId) {
          this.loadChatHistory();
          this.subscribeToMessages();
        }
      },
      error: (err) => console.error('Connection error:', err),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['chatId'] &&
      changes['chatId'].currentValue !== changes['chatId'].previousValue
    ) {
      this.exitSelectionMode();
      this.resetChat();
      if (this.isConnected && this.chatId) {
        this.loadChatHistory();
        this.subscribeToMessages();
      }
    }
  }

  private resetChat(): void {
    this.messages = [];
    this.selectedIds.clear();
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  private subscribeToMessages(): void {
    if (!this.chatId) return;
    this.messageSubscription = this.wsService
      .getChatMessages(this.chatId)
      .subscribe({
        next: (event: { payload?: Record<string, unknown> }) => {
          const raw = event?.payload ?? event;
          const id = String(raw?.['id'] ?? '');
          if (!id || this.messages.some((m) => m.id === id)) return;
          this.messages.push(toChatMessage(raw as Record<string, unknown>));
          this.sortMessages();
          this.shouldScroll = true;
        },
        error: (err) => console.error('Error receiving message:', err),
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
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {
      // ignore
    }
  }

  ngOnDestroy(): void {
    this.userStoreSubscription?.unsubscribe();
    this.connectionSubscription?.unsubscribe();
    this.messageSubscription?.unsubscribe();
  }

  sendMessage(): void {
    if (!this.chatId) return;
    const text = this.newMessage.value?.trim();
    if (text && this.isConnected) {
      this.wsService.sendMessage(this.chatId, text);
      this.newMessage.reset('');
    }
  }

  loadChatHistory(): void {
    if (!this.chatId) return;
    const url = `${environment.apiUrl}/chat/messages?chatId=${this.chatId}&offsets=2`;
    this.http.get<Record<string, unknown>[]>(url).subscribe({
      next: (list) => {
        this.messages = (Array.isArray(list) ? list : []).map((raw) =>
          toChatMessage(raw)
        );
        this.sortMessages();
        this.shouldScroll = true;
      },
      error: (err) => console.error('Failed to load chat history', err),
    });
  }

  private sortMessages(): void {
    this.messages.sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    );
    this.shouldScroll = true;
  }

  getSenderName(msg: ChatMessage): string {
    if (msg.senderId === this.currentUserId) return 'Вы';
    const s = msg.sender;
    if (s) return s.username ?? s.firstName ?? s.email ?? 'Пользователь';
    return 'Пользователь';
  }

  getDateKey(iso: string): string {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  formatDateLabel(dateKey: string): string {
    const [y, m, d] = dateKey.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateKey === this.getDateKey(today.toISOString())) return 'Сегодня';
    if (dateKey === this.getDateKey(yesterday.toISOString())) return 'Вчера';
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  }

  isSent(msg: ChatMessage): boolean {
    return msg.senderId === this.currentUserId;
  }

  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  toggleSelectionMode(): void {
    this.selectionMode = !this.selectionMode;
    if (!this.selectionMode) this.selectedIds.clear();
  }

  exitSelectionMode(): void {
    this.selectionMode = false;
    this.selectedIds.clear();
  }

  toggleMessageSelection(id: string): void {
    if (!this.selectionMode) return;
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
    this.selectedIds = new Set(this.selectedIds);
  }

  selectAll(): void {
    this.messages.forEach((m) => this.selectedIds.add(m.id));
    this.selectedIds = new Set(this.selectedIds);
  }

  clearSelection(): void {
    this.selectedIds.clear();
    this.selectedIds = new Set(this.selectedIds);
  }

  get selectedCount(): number {
    return this.selectedIds.size;
  }

  /** Переслать выбранные — заглушка под будущий бекенд */
  forwardSelected(): void {
    const ids = Array.from(this.selectedIds);
    console.log('Forward messages (backend not implemented):', ids);
    this.exitSelectionMode();
  }

  /** Удалить выбранные — заглушка под будущий бекенд */
  deleteSelected(): void {
    const ids = Array.from(this.selectedIds);
    console.log('Delete messages (backend not implemented):', ids);
    this.exitSelectionMode();
  }

  /** Копировать выбранные в буфер */
  copySelected(): void {
    const texts = this.messages
      .filter((m) => this.selectedIds.has(m.id))
      .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
      .map((m) => `[${this.getSenderName(m)} ${new Date(m.sentAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}]\n${m.text}`)
      .join('\n\n');
    if (texts) {
      navigator.clipboard?.writeText(texts);
    }
    this.exitSelectionMode();
  }
}
