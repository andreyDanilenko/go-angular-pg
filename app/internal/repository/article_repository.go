package repository

import (
	"admin/panel/internal/model"
	"context"
	"errors"
	"fmt"

	"gorm.io/gorm"
)

var (
	ErrArticleNotFound = errors.New("article not found")
	ErrInvalidCategory = errors.New("invalid article category")
	ErrNothingToDelete = errors.New("no articles were deleted")
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
	params model.ArticleInput,
) (*model.Article, error) {
	if !params.Category.IsValid() {
		return nil, fmt.Errorf("%w", ErrInvalidCategory)
	}

	article := &model.Article{
		AuthorID: authorID,
		Title:    params.Title,
		Content:  params.Content,
		Category: params.Category,
	}
	result := r.db.WithContext(ctx).Create(article)
	if result.Error != nil {
		return nil, result.Error
	}

	return article, nil
}

func (r *ArticleRepository) GetArticleByID(ctx context.Context, id string) (*model.Article, error) {
	var article model.Article

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

func (r *ArticleRepository) UpdateArticle(ctx context.Context, id string, params model.ArticleInput) (*model.Article, error) {
	var article model.Article
	if err := r.db.WithContext(ctx).First(&article, "id = ?", id).Error; err != nil {
		return nil, err
	}

	result := r.db.WithContext(ctx).
		Model(&article).
		Updates(map[string]interface{}{
			"title":    params.Title,
			"content":  params.Content,
			"category": params.Category,
		})

	if result.Error != nil {
		return nil, result.Error
	}

	return &article, nil
}

func (r *ArticleRepository) DeleteArticle(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).
		Where("id = ?", id).
		Delete(&model.Article{})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}
