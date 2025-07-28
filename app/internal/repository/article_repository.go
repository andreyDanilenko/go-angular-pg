package repository

import (
	"admin/panel/internal/model"
	"context"
	"errors"
	"fmt"
	"log"

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
	// Логируем начало операции
	log.Printf("Creating article for authorID: %s, title: %s, category: %s",
		authorID, params.Title, params.Category)

	// 1. Валидация категории
	if !params.Category.IsValid() {
		log.Printf("Invalid category: %s", params.Category)
		return nil, fmt.Errorf("%w", ErrInvalidCategory)
	}

	// 2. Проверка существования автора (с GORM)
	var authorCount int64
	if err := r.db.WithContext(ctx).
		Model(&model.User{}).
		Where("id = ?", authorID).
		Count(&authorCount).Error; err != nil {

		log.Printf("Error checking author existence: %v", err)
		return nil, fmt.Errorf("failed to check author: %w", err)
	}

	if authorCount == 0 {
		log.Printf("Author not found: %s", authorID)
		return nil, fmt.Errorf("author with id %s not found", authorID)
	}

	// 3. Создание статьи
	article := &model.Article{
		Title:    params.Title,
		Content:  params.Content,
		Category: params.Category,
		AuthorID: authorID,
	}

	if err := r.db.WithContext(ctx).Create(article).Error; err != nil {
		log.Printf("Error creating article: %v", err)

		// Проверяем, является ли ошибка нарушением внешнего ключа
		if errors.Is(err, gorm.ErrForeignKeyViolated) {
			log.Printf("Foreign key violation - author might not exist despite previous check")
			return nil, fmt.Errorf("author does not exist")
		}

		return nil, fmt.Errorf("failed to create article: %w", err)
	}

	log.Printf("Successfully created article with ID: %s", article.ID)
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
