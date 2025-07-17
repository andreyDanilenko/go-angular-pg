import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent {
  @Input() label: string = '';
  @Input() control!: AbstractControl;
  @Input() type: 'text' | 'email' | 'password' = 'text';
  @Input() placeholder: string = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() errorText: string = 'Поле заполнено некорректно';

  isPasswordVisible = false;

  get inputType() {
    return this.type === 'password' && !this.isPasswordVisible ? 'password' : 'text';
  }

  get showError() {
    return this.control.invalid && this.control.touched;
  }

  clear() {
    this.control.setValue('');
  }

  togglePassword() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
