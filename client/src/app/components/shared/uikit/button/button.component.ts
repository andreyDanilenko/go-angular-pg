import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() type: 'primary' | 'secondary' | 'text' | 'outline' = 'primary';
  @Input() disabled = false;
  @Input() iconLeft?: string;
  @Input() iconRight?: string;
  @Input() typeButton: 'button' | 'submit' | 'reset' = 'button';

  @Output() click = new EventEmitter<Event>();

  onClick(event: Event) {
    if (!this.disabled) {
      this.click.emit(event);
    } else {
      event.preventDefault();
    }
  }
}
