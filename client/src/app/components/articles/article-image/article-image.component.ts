import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-article-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './article-image.component.html',
})
export class ArticleImageComponent {
  @Input() text: string = 'Sample Text';
  @Input() bgColor: string = '3b82f6';
  @Input() textColor: string = 'ffffff';
  @Input() widthPercent: number = 100;
  @Input() height: number = 400;

  getPlaceholderStyles() {
    return {
      'width.%': this.widthPercent,
      'height.px': this.height,
      'background-color': `#${this.bgColor}`,
      'color': `#${this.textColor}`,
      'display': 'flex',
      'align-items': 'center',
      'text-align': 'center',
      'justify-content': 'center',
      'font-size': `${Math.min(this.height / 5, 48)}px`,
      'font-weight': 'bold',
      'padding': '0 16px',
    };
  }
}
