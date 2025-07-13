package service

import (
	"admin/panel/testJWT/internal/model"
	"admin/panel/testJWT/internal/repository"

	"context"
)

type ArticleService struct {
	repo *repository.ArticleRepository
}

func NewArticleService(repo *repository.ArticleRepository) *ArticleService {
	return &ArticleService{repo: repo}
}

func (s *ArticleService) CreateArticle(ctx context.Context, authorID string, input model.ArticleInput) (*model.Article, error) {
	return s.repo.CreateArticle(ctx, authorID, input.Title, input.Content)
}

func (s *ArticleService) GetArticle(ctx context.Context, id string) (*model.Article, error) {
	return s.repo.GetArticleByID(ctx, id)
}

func (s *ArticleService) GetArticlesByAuthor(ctx context.Context, authorID string) ([]*model.Article, error) {
	return s.repo.GetArticlesByAuthor(ctx, authorID)
}

func (s *ArticleService) GetAllArticles(ctx context.Context) ([]*model.Article, error) {
	return s.repo.GetAllArticles(ctx)
}

func (s *ArticleService) UpdateArticle(ctx context.Context, id string, input model.ArticleInput) (*model.Article, error) {
	return s.repo.UpdateArticle(ctx, id, input.Title, input.Content)
}

func (s *ArticleService) DeleteArticle(ctx context.Context, id string) error {
	return s.repo.DeleteArticle(ctx, id)
}
