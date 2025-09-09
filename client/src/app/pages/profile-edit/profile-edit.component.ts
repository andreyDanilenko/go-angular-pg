import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/types/user.model';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
  user: User | null = null;
  profileForm: FormGroup;
  loading = true;
  saving = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      middle_name: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    this.userService.getUserMe().subscribe({
      next: (user) => {
        this.user = user;
        console.log(user);

        this.profileForm.patchValue({
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          middle_name: user.middle_name || ''
        });

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.user) {
      this.saving = true;
      this.error = null;

      const updatedUser: User = {
        ...this.user,
        ...this.profileForm.value
      };

      this.userService.updateUserMe(updatedUser).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/profile']);
        },
        error: (error) => {
          this.error = 'Ошибка при сохранении';
          this.saving = false;
          console.error('Error updating profile:', error);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/profile']);
  }

  get email() { return this.profileForm.get('email'); }
  get first_name() { return this.profileForm.get('first_name'); }
  get last_name() { return this.profileForm.get('last_name'); }
}
