import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BaseApiService } from '../../core/services/base-api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private api = inject(BaseApiService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    firstName: [''],
    lastName: [''],
    middleName: ['']
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.api.post('signup', this.form.value).subscribe({
      next: () => {
        alert('Регистрация прошла успешно!');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        alert('Ошибка при регистрации: ' + err.message);
      }
    });
  }
}
