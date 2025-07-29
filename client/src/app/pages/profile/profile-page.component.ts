import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/types/user.model';
import { UserStore } from '../../stores/user-store/user.store';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule], // Импортируем необходимые модули
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {
  isEditMode = false;
  currentUser: User | null = null;
  editedUser: {
    username?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    email?: string;
  } = {};

  constructor(
    private userStore: UserStore,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userStore.state$.subscribe(state => {
      this.currentUser = state.currentUser;
      if (this.currentUser) {
        this.editedUser = {
          username: this.currentUser.username,
          firstName: this.currentUser.firstName,
          lastName: this.currentUser.lastName,
          middleName: this.currentUser.middleName,
          email: this.currentUser.email
        };
      }
    });

    this.userService.getUserMe().subscribe();
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.currentUser && !this.isEditMode) {
      this.resetEditedUser();
    }
  }

  resetEditedUser(): void {
    if (this.currentUser) {
      this.editedUser = {
        username: this.currentUser.username,
        firstName: this.currentUser.firstName,
        lastName: this.currentUser.lastName,
        middleName: this.currentUser.middleName,
        email: this.currentUser.email
      };
    }
  }

  isFormValid(): boolean {
    return !!(
      this.editedUser.username &&
      this.editedUser.firstName &&
      this.editedUser.lastName &&
      this.editedUser.email
    );
  }

  saveChanges(): void {
    if (this.currentUser) {
      const updatedUser: User = {
        ...this.currentUser,
        ...this.editedUser
      };

      this.userService.updateUser(updatedUser).subscribe({
        next: (response) => {
          this.currentUser = response
          this.isEditMode = false;
        },
        error: (err) => {
          console.error('Ошибка при обновлении:', err);
        }
      });
    }
  }
}
