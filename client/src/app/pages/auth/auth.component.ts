import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BaseApiService } from '../../core/services/base-api.service';
import { AuthService } from '../../core/services/auth.service';
import { InputComponent } from '../../components/shared/uikit/input/input.component';
import { ModalComponent } from '../../components/shared/modal/modal.component';
import { AuthInfoComponent } from '../../components/modalContents/auth-info-modal/auth-info-modal';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    ModalComponent,
    AuthInfoComponent
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  private fb = inject(FormBuilder);
  private api = inject(BaseApiService);
  private router = inject(Router);
  private auth = inject(AuthService);

  constructor(private modalService: ModalService) {}

  isCodeVerification = false;
  apiError: string | null = null;
  userEmail: string = '';

  canResendCode: boolean = false;
  remainingTime: number = 0;
  private resendTimer: any;

  @ViewChild('modalAuthInfoContent') modalAuthInfoContent!: TemplateRef<any>;


  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    invite: ['', [Validators.required]],
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  ngOnInit() {
    this.form.get('code')?.disable();
  }

  ngOnDestroy() {
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
    }
  }

  openModal() {
    this.modalService.open({
      content: this.modalAuthInfoContent,
      isHeader: true,
      title: 'Что вы хотите создать?'
    });
  }

  onAuthRequest() {
    this.api.post('auth', {
      email: this.form.value.email,
      password: this.form.value.password,
      invite: this.form.value.invite,
    }).subscribe({
        next: (response: any) => {
          this.userEmail = this.form.value.email;
          this.isCodeVerification = true;
          this.form.get('email')?.enable();
          this.form.get('password')?.enable();
          this.form.get('code')?.enable();
          this.form.get('invite')?.enable();

          this.canResendCode = false;
          this.remainingTime = 120;
          this.resendTimer = setInterval(() => {
            this.remainingTime--;
            if (this.remainingTime <= 0) {
              clearInterval(this.resendTimer);
              this.canResendCode = true;
            }
          }, 1000);
        },
      error: (err) => {
        this.apiError = err?.error?.message || 'Ошибка при входе';
      }
    });
  }

  onSubmit() {
    this.apiError = null;
    if (this.form.invalid) return;

    if (!this.isCodeVerification) {
      this.onAuthRequest()
    } else {
      this.api.post('confirm', {
        email: this.userEmail,
        code: this.form.value.code
      }).subscribe({
        next: (response: any) => {
          if (response.token) {
            this.auth.setToken(response.token);
            this.router.navigate(['/']);
          } else {
            this.apiError = 'Некорректный ответ сервера';
          }
        },
        error: (err) => {
          this.apiError = err?.error?.message || 'Ошибка при проверке кода';
        }
      });
    }
  }
}
