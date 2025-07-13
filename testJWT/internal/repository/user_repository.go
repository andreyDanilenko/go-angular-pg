package repository

import (
	"admin/panel/testJWT/internal/model"
	"context"
	"errors"
	"fmt"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, input model.SignUpInput) (*model.User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("password hashing failed: %w", err)
	}

	user := &model.User{
		Username:  input.Username,
		FirstName: input.FirstName,
		LastName:  input.LastName,
		// MiddleName: input.MiddleName,
		Email:    input.Email,
		Password: string(hashedPassword),
	}

	if err := r.db.WithContext(ctx).Create(user).Error; err != nil {
		return nil, fmt.Errorf("user creation failed: %w", err)
	}

	return user, nil
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*model.User, error) {
	var user model.User
	err := r.db.WithContext(ctx).First(&user, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &user, err
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	var user model.User
	err := r.db.WithContext(ctx).
		Where("email = ?", email).
		First(&user).
		Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &user, err
}

func (r *UserRepository) CheckEmailAndUsername(ctx context.Context, email, username string) (emailExists bool, usernameExists bool, err error) {
	var count int64

	// Проверяем email
	if err := r.db.WithContext(ctx).
		Model(&model.User{}).
		Where("email = ?", email).
		Count(&count).Error; err != nil {
		return false, false, err
	}
	emailExists = count > 0

	// Проверяем username
	count = 0
	if err := r.db.WithContext(ctx).
		Model(&model.User{}).
		Where("username = ?", username).
		Count(&count).Error; err != nil {
		return false, false, err
	}
	usernameExists = count > 0

	return emailExists, usernameExists, nil
}
