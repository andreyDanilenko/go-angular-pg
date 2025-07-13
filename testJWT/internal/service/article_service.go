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

func (s *ArticleService) CreateArticle(ctx context.Context, authorID uint, input model.ArticleInput) (*model.Article, error) {
	return s.repo.CreateArticle(ctx, authorID, input.Title, input.Content)
}

func (s *ArticleService) GetArticle(ctx context.Context, id uint) (*model.Article, error) {
	return s.repo.GetArticleByID(ctx, id)
}

func (s *ArticleService) GetArticlesByAuthor(ctx context.Context, authorID uint) ([]*model.Article, error) {
	return s.repo.GetArticlesByAuthor(ctx, authorID)
}

func (s *ArticleService) UpdateArticle(ctx context.Context, id int64, input model.ArticleInput) (*model.Article, error) {
	return s.repo.UpdateArticle(ctx, id, input.Title, input.Content)
}

func (s *ArticleService) DeleteArticle(ctx context.Context, id uint) error {
	return s.repo.DeleteArticle(ctx, id)
}
