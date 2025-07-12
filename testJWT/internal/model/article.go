package model

import "time"

type Article struct {
	ID        int64     `json:"id"`
	AuthorID  int64     `json:"author_id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type ArticleInput struct {
	Title   string `json:"title" validate:"required,min=5,max=100"`
	Content string `json:"content" validate:"required,min=10"`
}
