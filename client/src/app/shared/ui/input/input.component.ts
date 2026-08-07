import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent {
  @Input({ required: true }) inputId = '';
  @Input({ required: true }) label = '';
  @Input({ required: true }) control!: FormControl<string>;
  @Input() type: 'text' | 'email' | 'password' = 'text';
  @Input() autocomplete = 'off';
  @Input() placeholder = '';
  @Input() errorMessage = '';

  get showError(): boolean {
    return this.control.invalid && (this.control.dirty || this.control.touched);
  }
}
