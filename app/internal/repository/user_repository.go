package repository

import (
	"admin/panel/internal/model"
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
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

func (r *UserRepository) GetAll(ctx context.Context) ([]model.User, error) {
	var users []model.User
	err := r.db.WithContext(ctx).Find(&users).Error
	if err != nil {
		return nil, err
	}
	return users, nil
}

// Получить пользователя по ID
func (r *UserRepository) GetByID(ctx context.Context, id string) (*model.User, error) {
	var user model.User
	err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil // пользователь не найден
	}
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) UpdateUser(ctx context.Context, id string, input model.UpdateUserInput) (*model.User, error) {
	var user model.User
	if err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error; err != nil {
		return nil, err
	}

	// Обновляем нужные поля
	user.Username = input.Username
	user.FirstName = input.FirstName
	user.LastName = input.LastName

	if err := r.db.WithContext(ctx).Save(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
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

func (r *UserRepository) CreateEmailVerificationToken(ctx context.Context, userID string) (string, error) {
	token := uuid.New().String()
	expiry := time.Now().Add(24 * time.Hour)

	evToken := &model.EmailVerificationToken{
		ID:        uuid.New().String(),
		UserID:    userID,
		Token:     token,
		ExpiresAt: expiry,
	}

	if err := r.db.WithContext(ctx).Create(evToken).Error; err != nil {
		return "", err
	}
	return token, nil
}

func (r *UserRepository) GetEmailVerificationToken(ctx context.Context, token string) (*model.EmailVerificationToken, error) {
	var evToken model.EmailVerificationToken
	err := r.db.WithContext(ctx).Where("token = ?", token).First(&evToken).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &evToken, err
}

func (r *UserRepository) MarkEmailAsVerified(ctx context.Context, userID string) error {
	now := time.Now()
	return r.db.WithContext(ctx).
		Model(&model.User{}).
		Where("id = ?", userID).
		Updates(map[string]interface{}{
			"is_email_verified": true,
			"email_verified_at": now,
		}).Error
}

func (r *UserRepository) DeleteEmailVerificationToken(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).
		Where("id = ?", id).
		Delete(&model.EmailVerificationToken{}).
		Error
}
