package model

import (
	"time"

	"github.com/jaevor/go-nanoid"
	"gorm.io/gorm"
)

type User struct {
	ID           string    `gorm:"primaryKey;size:12" json:"id"`
	Username     string    `gorm:"size:50" json:"username" validate:"omitempty,min=3,max=50"`
	FirstName    string    `gorm:"size:50" json:"first_name,omitempty" validate:"omitempty,min=2,max=50"`
	LastName     string    `gorm:"size:50" json:"last_name,omitempty" validate:"omitempty,min=2,max=50"`
	MiddleName   string    `gorm:"size:50" json:"middle_name,omitempty" validate:"omitempty,max=50"`
	Bio          string    `gorm:"type:text" json:"bio,omitempty" validate:"omitempty,max=2000"`
	Email        string    `gorm:"uniqueIndex;size:255;not null" json:"email" validate:"required,email"`
	Password     string    `gorm:"size:255;not null" json:"-"`
	Role         UserRole  `gorm:"size:20;default:'user'" json:"role"`
	Token        string    `gorm:"index" json:"-"`
	TokenExpires time.Time `json:"-"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (u *User) BeforeCreate(_ *gorm.DB) error {
	if u.ID != "" {
		return nil
	}

	generateID, err := nanoid.Standard(12)
	if err != nil {
		return err
	}
	u.ID = generateID()
	return nil
}

type UpdateUserInput struct {
	Username   string `json:"username" validate:"omitempty,min=3,max=50"`
	FirstName  string `json:"first_name" validate:"omitempty,min=2,max=50"`
	LastName   string `json:"last_name" validate:"omitempty,min=2,max=50"`
	MiddleName string `json:"middle_name" validate:"omitempty,max=50"`
	Bio        string `json:"bio" validate:"omitempty,max=2000"`
}

type SignInInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8,max=128"`
}

type EmailCode struct {
	ID        string    `gorm:"primaryKey;size:12"`
	UserID    string    `gorm:"index;size:12;not null"`
	Code      string    `gorm:"size:6;not null"`
	ExpiresAt time.Time `gorm:"index;not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
}

func (c *EmailCode) BeforeCreate(_ *gorm.DB) error {
	if c.ID != "" {
		return nil
	}

	generateID, err := nanoid.Standard(12)
	if err != nil {
		return err
	}
	c.ID = generateID()
	return nil
}

type ConfirmCodeInput struct {
	Email string `json:"email" validate:"required,email"`
	Code  string `json:"code" validate:"required,len=6,numeric"`
}
