package service

import (
	"admin/panel/internal/middleware"
	"admin/panel/internal/model"
	"admin/panel/internal/repository"
	"fmt"

	"context"
)

type ArticleService struct {
	repo *repository.ArticleRepository
}

func NewArticleService(repo *repository.ArticleRepository) *ArticleService {
	return &ArticleService{repo: repo}
}

func (s *ArticleService) CreateArticle(
	ctx context.Context,
	authorID string,
	input model.ArticleInput,
) (*model.Article, error) {
	if !input.Category.IsValid() {
		return nil, fmt.Errorf("invalid article category")
	}

	return s.repo.CreateArticle(
		ctx,
		authorID,
		input,
	)
}

func (s *ArticleService) GetArticle(ctx context.Context, id string) (*model.Article, error) {
	return s.repo.GetArticleByID(ctx, id)
}

func (s *ArticleService) GetArticlesByAuthor(ctx context.Context, authorID string) ([]*model.Article, error) {
	return s.repo.GetArticlesByAuthor(ctx, authorID)
}

func (s *ArticleService) GetAllArticles(ctx context.Context) ([]*model.ArticleWithAuthor, error) {
	return s.repo.GetAllArticles(ctx)
}

func (s *ArticleService) UpdateArticle(ctx context.Context, articleID string, userID string, input model.ArticleInput) (*model.Article, error) {
	article, err := s.repo.GetArticleByID(ctx, articleID)
	if err != nil {
		return nil, fmt.Errorf("repository update error: %w", err)
	}

	if article == nil {
		return nil, fmt.Errorf("not found: article %s not found", articleID)
	}

	if article.AuthorID != userID {
		role, ok := ctx.Value(middleware.RoleKey).(model.UserRole)
		if !ok || role != model.RoleAdmin {
			return nil, fmt.Errorf("forbidden: user %s is not author of article %s", userID, articleID)
		}
	}

	updatedArticle, err := s.repo.UpdateArticle(ctx, articleID, input)
	if err != nil {
		return nil, fmt.Errorf("repository update error: %w", err)
	}

	return updatedArticle, nil
}

func (s *ArticleService) DeleteArticle(ctx context.Context, articleID, userID string) error {
	article, err := s.repo.GetArticleByID(ctx, articleID)
	if err != nil {
		return fmt.Errorf("repository update error: %w", err)
	}

	if article == nil {
		return fmt.Errorf("not found: article %s not found", articleID)
	}

	if article.AuthorID != userID {
		role, ok := ctx.Value(middleware.RoleKey).(model.UserRole)
		if !ok || role != model.RoleAdmin {
			return fmt.Errorf("forbidden: user %s is not author of article %s", userID, articleID)
		}
	}

	return s.repo.DeleteArticle(ctx, articleID)
}
