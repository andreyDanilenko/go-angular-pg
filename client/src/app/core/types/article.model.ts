import { User } from "./user.model";

export interface Article {
  id: string;
  authorId: string;
  title: string;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  author?: User;
  category: ArticleCategory;
}

export type ArticleCategory =
  | 'general'
  | 'tech'
  | 'science'
  | 'politics'
  | 'health'
  | string;
