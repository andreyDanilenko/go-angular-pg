import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';

import {
  ARTICLE_CATEGORY_LABELS,
  Article,
  ArticleCategory,
} from '../../../core/types/article.model';

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './article-card.component.html',
  styleUrl: './article-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleCardComponent {
  @Input({ required: true }) article!: Article;

  readonly categoryLabels = ARTICLE_CATEGORY_LABELS;

  categoryLabel(category: ArticleCategory): string {
    return this.categoryLabels[category];
  }
}
