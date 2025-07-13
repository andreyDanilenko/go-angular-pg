package model

import (
	"time"

	"github.com/jaevor/go-nanoid"
	"gorm.io/gorm"
)

type User struct {
	ID         string    `gorm:"primaryKey;size:36" json:"id"` // NanoID (12 символов)
	Username   string    `gorm:"uniqueIndex;size:50;not null" json:"username" validate:"required,min=3,max=50"`
	FirstName  string    `gorm:"size:50" json:"firstName,omitempty" validate:"omitempty,min=2,max=50"` // Необязательное
	LastName   string    `gorm:"size:50" json:"lastName,omitempty" validate:"omitempty,min=2,max=50"`  // Необязательное
	MiddleName string    `gorm:"size:50" json:"middleName,omitempty"`                                  // Необязательное
	Email      string    `gorm:"uniqueIndex;size:255;not null" json:"email" validate:"required,email"`
	Password   string    `gorm:"size:255;not null" json:"-"` // Пароль исключён
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}

// BeforeCreate — хук для генерации NanoID
func (u *User) BeforeCreate(tx *gorm.DB) error {
	genID, err := nanoid.Standard(12)
	if err != nil {
		return err
	}
	u.ID = genID()
	return nil
}

type SignUpInput struct {
	Username  string `json:"username" validate:"required,min=3,max=50"`
	FirstName string `json:"firstName,omitempty" validate:"omitempty,min=2,max=50"`
	LastName  string `json:"lastName,omitempty" validate:"omitempty,min=2,max=50"`
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=8"`
}

type SignInInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}
