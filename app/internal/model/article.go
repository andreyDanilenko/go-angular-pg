package model

import (
	"time"

	"github.com/jaevor/go-nanoid"
	"gorm.io/gorm"
)

type Article struct {
	ID        string          `gorm:"primaryKey;size:12" json:"id"`
	AuthorID  string          `gorm:"size:12;not null;index" json:"authorId"`
	Title     string          `gorm:"size:100;not null" json:"title"`
	Content   string          `gorm:"type:text;not null" json:"content"`
	Category  ArticleCategory `gorm:"size:50;not null;default:'general'" json:"category"`
	CreatedAt time.Time       `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time       `gorm:"autoUpdateTime" json:"updatedAt"`
}

func (a *Article) BeforeCreate(_ *gorm.DB) error {
	if a.ID != "" {
		return nil
	}

	generateID, err := nanoid.Standard(12)
	if err != nil {
		return err
	}
	a.ID = generateID()
	return nil
}

type ArticleWithAuthor struct {
	Article
	AuthorName string `json:"authorName"`
}

type ArticleInput struct {
	Title    string          `json:"title" validate:"required,min=5,max=100"`
	Content  string          `json:"content" validate:"required,min=10,max=50000"`
	Category ArticleCategory `json:"category" validate:"required"`
}
