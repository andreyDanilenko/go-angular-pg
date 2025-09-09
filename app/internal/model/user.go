package model

import (
	"log"
	"time"

	"github.com/jaevor/go-nanoid"
	"gorm.io/gorm"
)

type UserShort struct {
	ID        string   `json:"id"`
	Username  string   `json:"username"`
	FirstName string   `json:"first_name,omitempty"`
	LastName  string   `json:"last_name,omitempty"`
	Email     string   `json:"email"`
	Role      UserRole `gorm:"size:20;default:'guest'" json:"role"`
}

type User struct {
	ID           string    `gorm:"primaryKey;size:12" json:"id"` // NanoID (12 символов)
	Username     string    `gorm:"size:50" json:"username" validate:"omitempty,min=3,max=50"`
	FirstName    string    `gorm:"size:50" json:"first_name,omitempty" validate:"omitempty,min=2,max=50"` // Необязательное
	LastName     string    `gorm:"size:50" json:"last_name,omitempty" validate:"omitempty,min=2,max=50"`  // Необязательное
	MiddleName   string    `gorm:"size:50" json:"middle_name,omitempty"`                                  // Необязательное
	Email        string    `gorm:"uniqueIndex;size:255;not null" json:"email" validate:"required,email"`
	Password     string    `gorm:"size:255;not null" json:"-"` // Пароль исключён
	Role         UserRole  `gorm:"size:20;default:'guest'" json:"role"`
	Token        string    `gorm:"index" json:"token"`
	TokenExpires time.Time `json:"token_expires"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

type ArticleWithAuthor struct {
	Article
	AuthorID   string `json:"authorId"`
	AuthorName string `json:"authorName"`
}

type UpdateUserInput struct {
	Username   string `gorm:"size:50" json:"username" validate:"omitempty,min=3,max=50"`
	FirstName  string `gorm:"size:50" json:"first_name,omitempty" validate:"omitempty,min=2,max=50"` // Необязательное
	LastName   string `gorm:"size:50" json:"last_name,omitempty" validate:"omitempty,min=2,max=50"`  // Необязательное
	MiddleName string `gorm:"size:50" json:"middle_name,omitempty"`                                  // Необязательное
	Role       string `json:"role,omitempty"`                                                        // роль меняется только админом
}

// BeforeCreate — хук для генерации NanoID
func (u *User) BeforeCreate(tx *gorm.DB) error {
	genID, err := nanoid.Standard(12)
	if err != nil {
		log.Println("ERROR generating NanoID:", err)
		return err
	}
	u.ID = genID()
	log.Println("Generated user ID:", u.ID)
	return nil
}

type SignInInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}
type EmailCode struct {
	ID        string `gorm:"primaryKey"`
	UserID    string `gorm:"index;not null"`
	Code      string `gorm:"not null"` // 6 цифр
	ExpiresAt time.Time
	CreatedAt time.Time
}

func (u *EmailCode) BeforeCreate(tx *gorm.DB) error {
	genID, err := nanoid.Standard(12)
	if err != nil {
		return err
	}
	u.ID = genID()
	return nil
}

type ConfirmCodeInput struct {
	Email string `json:"email" validate:"required,email"`
	Code  string `json:"code" validate:"required,len=6"`
}
