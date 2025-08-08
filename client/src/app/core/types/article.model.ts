export interface Article {
  id: string;
  authorId: string;
  title: string;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  category: ArticleCategory;
  authorName: string;
}

export enum ArticleCategory {
  General = 'general',
  Tech = 'tech',
  Science = 'science',
  Politics = 'politics',
  Health = 'health'
}

