package repository

import (
	"admin/panel/testJWT/internal/model"

	"context"
	"database/sql"
)

type ArticleRepository struct {
	db *sql.DB
}

func NewArticleRepository(db *sql.DB) *ArticleRepository {
	return &ArticleRepository{db: db}
}

func (r *ArticleRepository) CreateArticle(ctx context.Context, authorID int64, title, content string) (*model.Article, error) {
	query := `
		INSERT INTO articles (author_id, title, content)
		VALUES ($1, $2, $3)
		RETURNING id, author_id, title, content, created_at, updated_at
	`

	article := &model.Article{}
	err := r.db.QueryRowContext(ctx, query, authorID, title, content).
		Scan(&article.ID, &article.AuthorID, &article.Title, &article.Content, &article.CreatedAt, &article.UpdatedAt)

	return article, err
}

func (r *ArticleRepository) GetArticleByID(ctx context.Context, id int64) (*model.Article, error) {
	query := `
		SELECT id, author_id, title, content, created_at, updated_at
		FROM articles
		WHERE id = $1
	`

	article := &model.Article{}
	err := r.db.QueryRowContext(ctx, query, id).
		Scan(&article.ID, &article.AuthorID, &article.Title, &article.Content, &article.CreatedAt, &article.UpdatedAt)

	return article, err
}

func (r *ArticleRepository) GetArticlesByAuthor(ctx context.Context, authorID int64) ([]*model.Article, error) {
	query := `
		SELECT id, author_id, title, content, created_at, updated_at
		FROM articles
		WHERE author_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, authorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var articles []*model.Article
	for rows.Next() {
		var article model.Article
		if err := rows.Scan(
			&article.ID,
			&article.AuthorID,
			&article.Title,
			&article.Content,
			&article.CreatedAt,
			&article.UpdatedAt,
		); err != nil {
			return nil, err
		}
		articles = append(articles, &article)
	}

	return articles, nil
}

func (r *ArticleRepository) UpdateArticle(ctx context.Context, id int64, title, content string) (*model.Article, error) {
	query := `
		UPDATE articles
		SET title = $1, content = $2, updated_at = NOW()
		WHERE id = $3
		RETURNING id, author_id, title, content, created_at, updated_at
	`

	article := &model.Article{}
	err := r.db.QueryRowContext(ctx, query, title, content, id).
		Scan(&article.ID, &article.AuthorID, &article.Title, &article.Content, &article.CreatedAt, &article.UpdatedAt)

	return article, err
}

func (r *ArticleRepository) DeleteArticle(ctx context.Context, id int64) error {
	query := `DELETE FROM articles WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
