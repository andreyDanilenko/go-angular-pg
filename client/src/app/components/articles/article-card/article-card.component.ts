import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  ARTICLE_CATEGORY_LABELS,
  Article,
  ArticleCategory,
} from '../../../core/types/article.model';

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './article-card.component.html',
  styleUrl: './article-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleCardComponent {
  @Input({ required: true }) article!: Article;

  categoryLabel(category: ArticleCategory): string {
    return ARTICLE_CATEGORY_LABELS[category];
  }
}
