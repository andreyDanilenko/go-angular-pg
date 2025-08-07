import { Component, HostListener } from '@angular/core';
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
export class MessengerPageComponent {
  selectedChatId: string | null = null;
  currentUser: User | null = null;
  isDrawerOpen = false;
  isEditMode = false;


  onChatSelected(chatId: string) {
    this.selectedChatId = chatId;
  }

  constructor(
    private userStore: UserStore,
  ) {}

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: Event) {
    this.selectedChatId = null;
  }

  handleReturnClick() {
    this.selectedChatId = null;
  }

  ngOnInit(): void {
    this.userStore.state$.subscribe(state => {
      this.currentUser = state.currentUser;
    });
  }

  handleBurgerClick() {
    this.isDrawerOpen = !this.isDrawerOpen
    console.log('Заходит');
  }

  handleEditClick() {
    this.isEditMode = true
  }

  handleBackToChats() {
    this.isEditMode = false;
  }

  get displayName(): string {
    if (!this.currentUser) return '';
    if (this.currentUser.firstName && this.currentUser.lastName) {
      return `${this.currentUser.lastName} ${this.currentUser.firstName}`;
    }

    return `${this.currentUser.email}`;
  }

}
