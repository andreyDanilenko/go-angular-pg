import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Article } from '../../../core/types/article.model';
import { ArticleCardComponent } from '../article-card/article-card.component';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [ArticleCardComponent],
  templateUrl: './article-list.component.html',
  styleUrl: './article-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleListComponent {
  @Input({ required: true }) articles: readonly Article[] = [];
}
