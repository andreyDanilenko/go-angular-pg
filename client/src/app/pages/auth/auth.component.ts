import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { BaseApiService } from '../../core/services/base-api.service';
import { AuthService } from '../../core/services/auth.service';
import { InputComponent } from '../../components/uikit/input/input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputComponent
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})

export class AuthComponent {
  private fb = inject(FormBuilder);
  private api = inject(BaseApiService);
  private router = inject(Router);
  private auth = inject(AuthService);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  apiError: string | null = null;

  onSubmit() {
    this.apiError = null;

    if (this.form.invalid) return;

    this.api.post('signin', this.form.value).subscribe({
      next: (response: any) => {
        if (response.token) {
          this.auth.setToken(response.token);
          this.router.navigate(['/']);
        } else {
          this.apiError = 'Некорректный ответ сервера';
        }
      },
      error: (err) => {
        this.apiError = err?.error?.message || 'Ошибка при входе';
      }
    });
  }
}
