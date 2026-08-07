import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { getApiErrorMessage } from '../../core/api/api-error';
import { AuthApi } from '../../core/auth/auth-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { AlertComponent } from '../../shared/ui/alert/alert.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { InputComponent } from '../../shared/ui/input/input.component';

const RESEND_DELAY_SECONDS = 120;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AlertComponent,
    ButtonComponent,
    InputComponent,
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent implements OnDestroy {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly authApi = inject(AuthApi);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private resendTimer: ReturnType<typeof setInterval> | null = null;

  readonly isCodeStep = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly remainingSeconds = signal(0);
  readonly requestedEmail = signal('');

  readonly credentialsForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  readonly codeForm = this.formBuilder.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  ngOnDestroy(): void {
    this.stopResendTimer();
  }

  submit(): void {
    this.errorMessage.set('');
    if (this.isCodeStep()) {
      this.confirmCode();
    } else {
      this.requestCode();
    }
  }

  requestCode(): void {
    if (this.credentialsForm.invalid || this.isSubmitting()) {
      this.credentialsForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    const input = this.credentialsForm.getRawValue();

    this.authApi.requestCode(input).subscribe({
      next: () => {
        this.requestedEmail.set(input.email);
        this.isCodeStep.set(true);
        this.isSubmitting.set(false);
        this.startResendTimer();
      },
      error: (error: unknown) => {
        this.errorMessage.set(
          getApiErrorMessage(error, 'Не удалось отправить код подтверждения.'),
        );
        this.isSubmitting.set(false);
      },
    });
  }

  confirmCode(): void {
    if (this.codeForm.invalid || this.isSubmitting()) {
      this.codeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.authApi
      .confirmCode({
        email: this.requestedEmail(),
        code: this.codeForm.controls.code.value,
      })
      .subscribe({
        next: ({ token }) => {
          this.authService.setToken(token);
          void this.router.navigate(['/articles']);
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            getApiErrorMessage(error, 'Код недействителен или истёк.'),
          );
          this.isSubmitting.set(false);
        },
      });
  }

  private startResendTimer(): void {
    this.stopResendTimer();
    this.remainingSeconds.set(RESEND_DELAY_SECONDS);
    this.resendTimer = setInterval(() => {
      const nextValue = this.remainingSeconds() - 1;
      this.remainingSeconds.set(Math.max(0, nextValue));
      if (nextValue <= 0) {
        this.stopResendTimer();
      }
    }, 1000);
  }

  private stopResendTimer(): void {
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
      this.resendTimer = null;
    }
  }
}
