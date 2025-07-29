import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/types/user.model';
import { UserStore } from '../../stores/user-store/user.store';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

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
      // Сбрасываем editedUser при каждом изменении currentUser
      this.resetEditedUser();
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    // При включении режима редактирования обновляем editedUser
    if (this.isEditMode) {
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
    } else {
      this.editedUser = {};
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
    if (this.currentUser && this.isFormValid()) {
      const updatedUser = {
        ...this.currentUser,
        ...this.editedUser
      };

      this.userService.updateUserMe(updatedUser).subscribe({
        next: (response) => {
          this.currentUser = response;
          this.isEditMode = false;
          // После успешного сохранения сбрасываем editedUser
          this.resetEditedUser();
        },
        error: (err) => {
          console.error('Ошибка при обновлении:', err);
        }
      });
    }
  }

  logout(): void {
      this.authService.logout();
      this.router.navigate(['/auth/login']);
  }

}
