package service

import (
	"context"
	"errors"

	"admin/panel/internal/model"
	"admin/panel/internal/repository"
)

var (
	ErrArticleForbidden       = errors.New("article action is forbidden")
	ErrInvalidArticleCategory = errors.New("invalid article category")
)

type ArticleService struct {
	repository *repository.ArticleRepository
}

func NewArticleService(repository *repository.ArticleRepository) *ArticleService {
	return &ArticleService{repository: repository}
}

func (s *ArticleService) Create(
	ctx context.Context,
	authorID string,
	input model.ArticleInput,
) (*model.Article, error) {
	if !input.Category.IsValid() {
		return nil, ErrInvalidArticleCategory
	}
	return s.repository.Create(ctx, authorID, input)
}

func (s *ArticleService) GetByID(ctx context.Context, id string) (*model.Article, error) {
	return s.repository.GetByID(ctx, id)
}

func (s *ArticleService) GetAll(ctx context.Context) ([]model.ArticleWithAuthor, error) {
	return s.repository.GetAll(ctx)
}

func (s *ArticleService) GetByAuthor(
	ctx context.Context,
	authorID string,
) ([]model.Article, error) {
	return s.repository.GetByAuthor(ctx, authorID)
}

func (s *ArticleService) Update(
	ctx context.Context,
	articleID string,
	userID string,
	role model.UserRole,
	input model.ArticleInput,
) (*model.Article, error) {
	if !input.Category.IsValid() {
		return nil, ErrInvalidArticleCategory
	}
	if err := s.authorize(ctx, articleID, userID, role); err != nil {
		return nil, err
	}
	return s.repository.Update(ctx, articleID, input)
}

func (s *ArticleService) Delete(
	ctx context.Context,
	articleID string,
	userID string,
	role model.UserRole,
) error {
	if err := s.authorize(ctx, articleID, userID, role); err != nil {
		return err
	}
	return s.repository.Delete(ctx, articleID)
}

func (s *ArticleService) authorize(
	ctx context.Context,
	articleID string,
	userID string,
	role model.UserRole,
) error {
	article, err := s.repository.GetByID(ctx, articleID)
	if err != nil {
		return err
	}
	if article.AuthorID != userID && role != model.RoleAdmin {
		return ErrArticleForbidden
	}
	return nil
}
