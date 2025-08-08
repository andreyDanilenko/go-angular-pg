import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleCardComponent } from '../article-card/article-card.component';
import { Article } from '../../../core/types/article.model';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, ArticleCardComponent],
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.css'],
})
export class ArticleListComponent {
  @Input() articles!: Article[];

  constructor() {}
}
