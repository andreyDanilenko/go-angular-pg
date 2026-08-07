import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaComponent {
  @Input({ required: true }) inputId = '';
  @Input({ required: true }) label = '';
  @Input({ required: true }) control!: FormControl<string>;
  @Input() placeholder = '';
  @Input() errorMessage = '';

  get showError(): boolean {
    return this.control.invalid && (this.control.dirty || this.control.touched);
  }
}
