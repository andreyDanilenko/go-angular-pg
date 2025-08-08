import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleCardComponent } from '../article-card/article-card.component';

interface Article {
  title: string;
  excerpt: string;
  tag: string;
  tagClass?: string;
  author: {
    name: string;
    avatar?: string;
  };
  date: Date | string;
  image?: {
    text: string;
    bgColor: string;
    textColor: string;
    widthPercent?: number;
    height?: number;
  };
}

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
