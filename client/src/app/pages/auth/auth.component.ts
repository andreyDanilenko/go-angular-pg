import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BaseApiService } from '../../core/services/base-api.service';
import { AuthService } from '../../core/services/auth.service';
import { InputComponent } from '../../components/uikit/input/input.component';
import { ButtonComponent } from '../../components/uikit/button/button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  private fb = inject(FormBuilder);
  private api = inject(BaseApiService);
  private router = inject(Router);
  private auth = inject(AuthService);

  isCodeVerification = false;
  apiError: string | null = null;
  userEmail: string = '';

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  ngOnInit() {
    // Показываем только поля email и password при загрузке
    this.form.get('code')?.disable();
  }

  onSubmit() {
    this.apiError = null;

    if (this.form.invalid) return;

    if (!this.isCodeVerification) {
      this.api.post('auth', {
        email: this.form.value.email,
        password: this.form.value.password
      }).subscribe({
        next: (response: any) => {
            this.userEmail = this.form.value.email;
            this.isCodeVerification = true;
            this.form.get('email')?.disable();
            this.form.get('password')?.disable();
            this.form.get('code')?.enable();
        },
        error: (err) => {
          this.apiError = err?.error?.message || 'Ошибка при входе';
        }
      });
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
