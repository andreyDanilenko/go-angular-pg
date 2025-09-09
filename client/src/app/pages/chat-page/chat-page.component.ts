import { Component, HostListener, OnDestroy } from '@angular/core';
import { ChatsComponent } from '../../components/messenger/chats/chats.component';
import { ChatComponent } from "../../components/messenger/chat/chat.component";
import { ChatPlaceholderComponent } from '../../components/messenger/chat/chat-placeholder.component';
import { UserStore } from '../../stores/user-store/user.store';
import { User } from '../../core/types/user.model';
import { ChatsHeaderComponent } from '../../components/messenger/chats-header/chats-header.component';
import { ChatHeaderComponent } from '../../components/messenger/chat-header/chat-header.component';
// import { DrawerComponent } from '../../components/shared/drawer/drawer.component';
import { CommonModule } from '@angular/common';
import { ChatsEditComponent } from '../../components/messenger/chats-edit/chats-edit.component';
import { ChatService } from '../../core/services/chat.service';
import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [
    ChatsComponent,
    ChatComponent,
    ChatPlaceholderComponent,
    ChatsHeaderComponent,
    ChatHeaderComponent,
    // DrawerComponent,
    CommonModule,
    ChatsEditComponent
  ],
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.css'
})
export class MessengerPageComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  selectedChatId: string | null = null;
  currentUser: User | null = null;
  users: User[] = [];
  isDrawerOpen = false;
  isEditMode = false;


  onChatSelected(chatId: string) {
    this.selectedChatId = chatId;
  }

  constructor(
    private userStore: UserStore,
    private userService: UserService,
    private chatService: ChatService
  ) {}

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: Event) {
    this.selectedChatId = null;
  }

  handleReturnClick() {
    this.selectedChatId = null;
  }

  ngOnInit(): void {
    this.userStore.state$.pipe(
      distinctUntilChanged((prev, curr) => prev.currentUser?.role === curr.currentUser?.role)
    ).subscribe(state => {
      this.currentUser = state.currentUser;

      if (state.currentUser?.role === 'admin') {
        this.loadUsers();
      } else {
        this.loadAdminUsers();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleEditClick() {
    this.isEditMode = true
  }

  handleCreateClick(userId: string) {
    this.chatService.createPrivateChat(userId).subscribe({
      next: (chat) => {
        this.selectedChatId = chat.id;
        this.isEditMode = false;
      },
      error: (err) => {
        console.error('Ошибка при создании чата:', err);
      }
    });
  }

  private loadAdminUsers(): void {
    this.userService.loadUsersOnlyAdmins().pipe(
      takeUntil(this.destroy$)
    ).subscribe(admins => {
        this.users = admins
    });
  }

  private loadUsers(): void {
    this.userService.loadUsers().pipe(
      takeUntil(this.destroy$)
    ).subscribe(users => {
        this.users = users
    });
  }


  handleBackToChats() {
    this.isEditMode = false;
  }

  get displayName(): string {
    if (!this.currentUser) return '';
    if (this.currentUser.first_name && this.currentUser.last_name) {
      return `${this.currentUser.last_name} ${this.currentUser.first_name}`;
    }

    return `${this.currentUser.email}`;
  }

}
