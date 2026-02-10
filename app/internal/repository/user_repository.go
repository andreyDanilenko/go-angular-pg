package repository

import (
	"admin/panel/internal/model"
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

func (r *UserRepository) Create(ctx context.Context, input model.SignInInput) (*model.User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("password hashing failed: %w", err)
	}

	user := &model.User{
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

	user.Username = input.Username
	user.FirstName = input.FirstName
	user.LastName = input.LastName
	user.MiddleName = input.MiddleName
	user.Bio = input.Bio

	if err := r.db.WithContext(ctx).Save(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *UserRepository) UpdateFields(ctx context.Context, userID string, updates map[string]interface{}) error {
	return r.db.WithContext(ctx).
		Model(&model.User{}).
		Where("id = ?", userID).
		Updates(updates).Error
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

func (r *UserRepository) CheckEmailAndUsername(ctx context.Context, email string) (emailExists bool, err error) {
	var count int64

	// Проверяем email
	if err := r.db.WithContext(ctx).
		Model(&model.User{}).
		Where("email = ?", email).
		Count(&count).Error; err != nil {
		return false, err
	}
	emailExists = count > 0

	// // Проверяем username
	// count = 0
	// if err := r.db.WithContext(ctx).
	// 	Model(&model.User{}).
	// 	Where("username = ?", username).
	// 	Count(&count).Error; err != nil {
	// 	return false, false, err
	// }
	// usernameExists = count > 0

	return emailExists, nil
}

// func (r *UserRepository) SaveEmailConfirmation(ctx context.Context, confirmation *model.EmailConfirmation) error {
// 	confirmation.ID = uuid.NewString()
// 	return r.db.WithContext(ctx).Create(confirmation).Error
// }

func (r *UserRepository) SaveEmailCode(ctx context.Context, code *model.EmailCode) error {
	return r.db.WithContext(ctx).Create(code).Error
}

func (r *UserRepository) GetEmailCode(ctx context.Context, userID, code string) (*model.EmailCode, error) {
	var c model.EmailCode
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND code = ?", userID, code).
		First(&c).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &c, err
}

func (r *UserRepository) DeleteEmailCode(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&model.EmailCode{}, "id = ?", id).Error
}

func (r *UserRepository) DeleteExistingEmailCodes(ctx context.Context, userID string) error {
	return r.db.WithContext(ctx).Delete(&model.EmailCode{}, "user_id = ?", userID).Error
}
