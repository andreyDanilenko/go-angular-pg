import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleListComponent } from '../../components/articles/article-list/article-list.component';

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
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ArticleListComponent],
  templateUrl: './articles-page.component.html',
  styleUrls: ['./articles-page.component.css'],
  styles: []
})
export class ArticlesPageComponent {
    articlesData: Article[] = [{
      title: 'Современные тренды в UI/UX дизайне 2024 года',
      excerpt: 'Разбираем самые актуальные тенденции в пользовательском интерфейсе и опыте взаимодействия с продуктами.',
      tag: 'Дизайн',
      tagClass: 'design',
      author: {
        name: 'Анна Петрова',
        avatar: 'https://placehold.co/24x24/e5e7eb/6b7280?text=А'
      },
      date: new Date(2024, 4, 15),
      image: {
        text: 'Modern UI Design',
        bgColor: '3b82f6',
        textColor: 'ffffff',
      }
    },
    {
      title: 'Современные тренды в UI/UX дизайне 2024 года',
      excerpt: 'Разбираем самые актуальные тенденции в пользовательском интерфейсе и опыте взаимодействия с продуктами.',
      tag: 'Дизайн',
      tagClass: 'design',
      author: {
        name: 'Анна Петрова',
        avatar: 'https://placehold.co/24x24/e5e7eb/6b7280?text=А'
      },
      date: new Date(2024, 4, 15),
      image: {
        text: 'Modern UI Design',
        bgColor: '3b82f6',
        textColor: 'ffffff',
      }
    }
  ];
}
