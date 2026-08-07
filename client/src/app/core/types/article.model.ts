export type ArticleCategory = 'general' | 'tech' | 'science' | 'politics' | 'health';

export type Article = {
  id: string;
  authorId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  category: ArticleCategory;
  authorName?: string;
};

export type ArticleInput = Pick<Article, 'title' | 'content' | 'category'>;

export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, string> = {
  general: 'Общее',
  tech: 'Технологии',
  science: 'Наука',
  politics: 'Политика',
  health: 'Здоровье',
};
