package repository

import (
	"admin/panel/internal/model"
	"context"
	"errors"
	"fmt"

	"gorm.io/gorm"
)

type ArticleRepository struct {
	db *gorm.DB
}

func NewArticleRepository(db *gorm.DB) *ArticleRepository {
	return &ArticleRepository{db: db}
}

func (r *ArticleRepository) CreateArticle(
	ctx context.Context,
	authorID string,
	title string,
	content string,
	category model.ArticleCategory,
) (*model.Article, error) {
	article := &model.Article{
		AuthorID: authorID,
		Title:    title,
		Content:  content,
		Category: category,
	}

	if !category.IsValid() {
		return nil, fmt.Errorf("invalid article category")
	}

	result := r.db.WithContext(ctx).Create(article)
	if result.Error != nil {
		return nil, result.Error
	}

	return article, nil
}

func (r *ArticleRepository) GetArticleByID(ctx context.Context, id string) (*model.Article, error) {
	var article model.Article

	// Явно указываем условие WHERE для строкового ID
	err := r.db.WithContext(ctx).
		Where("id = ?", id).
		First(&article).
		Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &article, nil
}

func (r *ArticleRepository) GetAllArticles(ctx context.Context) ([]*model.Article, error) {
	var articles []*model.Article
	result := r.db.WithContext(ctx).
		Order("created_at DESC").
		Find(&articles)

	if result.Error != nil {
		return nil, result.Error
	}

	return articles, nil
}

func (r *ArticleRepository) GetArticlesByAuthor(ctx context.Context, authorID string) ([]*model.Article, error) {
	var articles []*model.Article
	result := r.db.WithContext(ctx).
		Where("author_id = ?", authorID).
		Order("created_at DESC").
		Find(&articles)

	if result.Error != nil {
		return nil, result.Error
	}

	return articles, nil
}

func (r *ArticleRepository) UpdateArticle(ctx context.Context, id string, title, content string) (*model.Article, error) {
	var article model.Article
	if err := r.db.WithContext(ctx).First(&article, "id = ?", id).Error; err != nil {
		return nil, err
	}

	result := r.db.WithContext(ctx).
		Model(&article).
		Updates(map[string]interface{}{
			"title":   title,
			"content": content,
		})

	if result.Error != nil {
		return nil, result.Error
	}

	return &article, nil
}

func (r *ArticleRepository) DeleteArticle(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).
		Where("id = ?", id). // Явное указание условия
		Delete(&model.Article{})

	if result.Error != nil {
		return result.Error
	}

	// Проверяем, что действительно удалили запись
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}
