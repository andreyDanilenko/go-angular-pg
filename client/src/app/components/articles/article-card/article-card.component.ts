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

  categories = {
    general: {
      id: 'General',
      name: 'Общее',
      metaTitle: 'Общее',
      bgColor: '10b981',
    },
    tech: {
      id: 'Tech',
      name: 'Технологии',
      metaTitle: 'Технологии',
      bgColor: '3b82f6',
    },
    science: {
      id: 'Science',
      name: 'Наука',
      metaTitle: 'Наука',
      bgColor: 'ef4444',
    },
    politics: {
      id: 'Politics',
      name: 'Политика',
      metaTitle: 'Политика',
      bgColor: 'f59e0b',
    },
    health: {
      id: 'Health',
      name: 'Здоровье',
      metaTitle: 'Здоровье',
      bgColor: '7c3aed',
    },
  };

  get formattedDate(): string {
    return this.datePipe.transform(this.article.createdAt, 'd MMMM y') || '';
  }
}
