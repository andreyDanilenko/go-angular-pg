package model

import (
	"time"

	"github.com/jaevor/go-nanoid"
	"gorm.io/gorm"
)

type Article struct {
	ID        string    `gorm:"primaryKey;size:12" json:"id"`
	AuthorID  string    `gorm:"size:12;not null" json:"authorId"` // Связь с User.ID
	Title     string    `gorm:"size:100;not null" json:"title" validate:"required,min=5,max=100"`
	Content   string    `gorm:"type:text;not null" json:"content" validate:"required,min=10"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updatedAt"`

	Author   *User           `gorm:"foreignKey:AuthorID" json:"author,omitempty"` // Опциональная подгрузка автора
	Category ArticleCategory `gorm:"size:50;not null;default:'general'" json:"category,omitempty"`
}

// BeforeCreate - хук для генерации ID
func (a *Article) BeforeCreate(tx *gorm.DB) error {
	genID, err := nanoid.Standard(12)
	if err != nil {
		return err
	}
	a.ID = genID()
	return nil
}

type ArticleInput struct {
	Title    string          `json:"title" validate:"required,min=5,max=100"`
	Content  string          `json:"content" validate:"required,min=10"`
	Category ArticleCategory `gorm:"size:50;not null;default:'general'" json:"category,omitempty"`
}
