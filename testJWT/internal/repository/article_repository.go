package repository

import (
	"admin/panel/testJWT/internal/model"
	"context"
	"errors"

	"gorm.io/gorm"
)

type ArticleRepository struct {
	db *gorm.DB
}

func NewArticleRepository(db *gorm.DB) *ArticleRepository {
	return &ArticleRepository{db: db}
}

func (r *ArticleRepository) CreateArticle(ctx context.Context, authorID uint, title, content string) (*model.Article, error) {
	article := &model.Article{
		AuthorID: authorID,
		Title:    title,
		Content:  content,
	}

	result := r.db.WithContext(ctx).Create(article)
	if result.Error != nil {
		return nil, result.Error
	}

	return article, nil
}

func (r *ArticleRepository) GetArticleByID(ctx context.Context, id uint) (*model.Article, error) {
	var article model.Article
	result := r.db.WithContext(ctx).First(&article, id)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if result.Error != nil {
		return nil, result.Error
	}

	return &article, nil
}

func (r *ArticleRepository) GetArticlesByAuthor(ctx context.Context, authorID uint) ([]*model.Article, error) {
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

func (r *ArticleRepository) UpdateArticle(ctx context.Context, id int64, title, content string) (*model.Article, error) {
	article := &model.Article{
		Title:   title,
		Content: content,
	}

	result := r.db.WithContext(ctx).
		Model(&model.Article{}).
		Where("id = ?", id).
		Updates(article).
		First(article, id)

	if result.Error != nil {
		return nil, result.Error
	}

	return article, nil
}

func (r *ArticleRepository) DeleteArticle(ctx context.Context, id uint) error {
	result := r.db.WithContext(ctx).Delete(&model.Article{}, id)
	return result.Error
}
