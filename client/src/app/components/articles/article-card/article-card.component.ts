import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleImageComponent } from '../article-image/article-image.component';
import { DatePipe } from '@angular/common';
import { Article } from '../../../core/types/article.model';
import { TruncatePipe } from '../../../core/services/truncate.pipe';
@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [CommonModule, ArticleImageComponent, TruncatePipe],
  templateUrl: './article-card.component.html',
  styleUrls: ['./article-card.component.css'],
  providers: [DatePipe]
})
export class ArticleCardComponent {
  @Input() article!: Article;

  constructor(private datePipe: DatePipe) {}

  get formattedDate(): string {
    return this.datePipe.transform(this.article.createdAt, 'd MMMM y') || '';
  }
}
