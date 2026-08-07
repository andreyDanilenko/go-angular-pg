package repository

import (
	"context"
	"errors"
	"fmt"

	"admin/panel/internal/model"

	"gorm.io/gorm"
)

var ErrArticleNotFound = errors.New("article not found")

type ArticleRepository struct {
	db *gorm.DB
}

func NewArticleRepository(db *gorm.DB) *ArticleRepository {
	return &ArticleRepository{db: db}
}

func (r *ArticleRepository) Create(
	ctx context.Context,
	authorID string,
	input model.ArticleInput,
) (*model.Article, error) {
	var authorCount int64
	if err := r.db.WithContext(ctx).
		Model(&model.User{}).
		Where("id = ?", authorID).
		Count(&authorCount).Error; err != nil {
		return nil, fmt.Errorf("check article author: %w", err)
	}
	if authorCount == 0 {
		return nil, fmt.Errorf("check article author: user not found")
	}

	article := &model.Article{
		AuthorID: authorID,
		Title:    input.Title,
		Content:  input.Content,
		Category: input.Category,
	}
	if err := r.db.WithContext(ctx).Create(article).Error; err != nil {
		return nil, fmt.Errorf("create article: %w", err)
	}
	return article, nil
}

func (r *ArticleRepository) GetByID(ctx context.Context, id string) (*model.Article, error) {
	var article model.Article
	if err := r.db.WithContext(ctx).First(&article, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrArticleNotFound
		}
		return nil, fmt.Errorf("get article: %w", err)
	}
	return &article, nil
}

func (r *ArticleRepository) GetAll(ctx context.Context) ([]model.ArticleWithAuthor, error) {
	articles := make([]model.ArticleWithAuthor, 0)
	if err := r.db.WithContext(ctx).
		Table("articles").
		Select(`articles.*, COALESCE(NULLIF(users.username, ''), users.email, 'Без автора') AS author_name`).
		Joins("LEFT JOIN users ON users.id = articles.author_id").
		Order("articles.created_at DESC").
		Scan(&articles).Error; err != nil {
		return nil, fmt.Errorf("list articles: %w", err)
	}
	return articles, nil
}

func (r *ArticleRepository) GetByAuthor(
	ctx context.Context,
	authorID string,
) ([]model.Article, error) {
	articles := make([]model.Article, 0)
	if err := r.db.WithContext(ctx).
		Where("author_id = ?", authorID).
		Order("created_at DESC").
		Find(&articles).Error; err != nil {
		return nil, fmt.Errorf("list author articles: %w", err)
	}
	return articles, nil
}

func (r *ArticleRepository) Update(
	ctx context.Context,
	id string,
	input model.ArticleInput,
) (*model.Article, error) {
	result := r.db.WithContext(ctx).
		Model(&model.Article{}).
		Where("id = ?", id).
		Updates(map[string]any{
			"title":    input.Title,
			"content":  input.Content,
			"category": input.Category,
		})
	if result.Error != nil {
		return nil, fmt.Errorf("update article: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return nil, ErrArticleNotFound
	}
	return r.GetByID(ctx, id)
}

func (r *ArticleRepository) Delete(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).Delete(&model.Article{}, "id = ?", id)
	if result.Error != nil {
		return fmt.Errorf("delete article: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return ErrArticleNotFound
	}
	return nil
}
