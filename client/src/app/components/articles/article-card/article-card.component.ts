// article-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleImageComponent } from '../article-image/article-image.component';
import { DatePipe } from '@angular/common';

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
  selector: 'app-article-card',
  standalone: true,
  imports: [CommonModule, ArticleImageComponent],
  templateUrl: './article-card.component.html',
  styleUrls: ['./article-card.component.css'],
  providers: [DatePipe]
})
export class ArticleCardComponent {
  @Input() article!: Article;

  constructor(private datePipe: DatePipe) {}

  get formattedDate(): string {
    return this.datePipe.transform(this.article.date, 'd MMMM y') || '';
  }
}
