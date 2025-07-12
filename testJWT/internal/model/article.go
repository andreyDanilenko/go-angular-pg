package model

import (
	"gorm.io/gorm"
)

type Article struct {
	gorm.Model
	AuthorID uint   `json:"author_id"`
	Title    string `json:"title" gorm:"size:100"`
	Content  string `json:"content" gorm:"type:text"`
}
type ArticleInput struct {
	Title   string `json:"title" validate:"required,min=5,max=100"`
	Content string `json:"content" validate:"required,min=10"`
}
