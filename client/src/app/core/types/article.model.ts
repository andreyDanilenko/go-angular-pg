import { User } from "./user.model";

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

export type ArticleCategory =
  | 'general'
  | 'tech'
  | 'science'
  | 'politics'
  | 'health'
  | string;
