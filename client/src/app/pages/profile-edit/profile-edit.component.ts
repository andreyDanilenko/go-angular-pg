import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { getApiErrorMessage } from '../../core/api/api-error';
import { SessionService } from '../../core/session/session.service';
import { AlertComponent } from '../../shared/ui/alert/alert.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { TextareaComponent } from '../../shared/ui/textarea/textarea.component';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AlertComponent,
    ButtonComponent,
    InputComponent,
    SpinnerComponent,
    TextareaComponent,
  ],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileEditComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private initialized = false;

  readonly user = this.session.user;
  readonly isLoading = this.session.isLoading;
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');
  readonly form = this.formBuilder.group({
    username: ['', [Validators.minLength(3), Validators.maxLength(50)]],
    firstName: ['', [Validators.minLength(2), Validators.maxLength(50)]],
    lastName: ['', [Validators.minLength(2), Validators.maxLength(50)]],
    middleName: ['', [Validators.maxLength(50)]],
    bio: ['', [Validators.maxLength(2000)]],
  });

  constructor() {
    effect(() => {
      const user = this.user();
      if (user && !this.initialized) {
        this.form.setValue({
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          middleName: user.middleName,
          bio: user.bio,
        });
        this.initialized = true;
      }
    });
  }

  save(): void {
    if (this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.session.update(this.form.getRawValue()).subscribe({
      next: () => void this.router.navigate(['/profile']),
      error: (error: unknown) => {
        this.errorMessage.set(
          getApiErrorMessage(error, 'Не удалось сохранить профиль.'),
        );
        this.isSaving.set(false);
      },
    });
  }

  cancel(): void {
    void this.router.navigate(['/profile']);
  }
}
