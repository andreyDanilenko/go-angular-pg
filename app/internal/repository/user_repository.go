package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"admin/panel/internal/model"

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
		return nil, fmt.Errorf("hash password: %w", err)
	}

	user := &model.User{
		Email:    input.Email,
		Password: string(hashedPassword),
		Role:     model.RoleUser,
	}
	if err := r.db.WithContext(ctx).Create(user).Error; err != nil {
		return nil, fmt.Errorf("create user: %w", err)
	}
	return user, nil
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*model.User, error) {
	var user model.User
	if err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, fmt.Errorf("get user by ID: %w", err)
	}
	return &user, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	var user model.User
	if err := r.db.WithContext(ctx).First(&user, "email = ?", email).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, fmt.Errorf("get user by email: %w", err)
	}
	return &user, nil
}

func (r *UserRepository) Update(ctx context.Context, id string, input model.UpdateUserInput) (*model.User, error) {
	updates := map[string]any{
		"username":    input.Username,
		"first_name":  input.FirstName,
		"last_name":   input.LastName,
		"middle_name": input.MiddleName,
		"bio":         input.Bio,
	}
	if err := r.db.WithContext(ctx).
		Model(&model.User{}).
		Where("id = ?", id).
		Updates(updates).Error; err != nil {
		return nil, fmt.Errorf("update user: %w", err)
	}
	return r.GetByID(ctx, id)
}

func (r *UserRepository) GetEmailCode(
	ctx context.Context,
	userID string,
	code string,
) (*model.EmailCode, error) {
	var emailCode model.EmailCode
	if err := r.db.WithContext(ctx).
		First(&emailCode, "user_id = ? AND code = ?", userID, code).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, fmt.Errorf("get email code: %w", err)
	}
	return &emailCode, nil
}

func (r *UserRepository) ConsumeCodeAndSaveToken(
	ctx context.Context,
	codeID string,
	userID string,
	token string,
	expiresAt time.Time,
) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		result := tx.Delete(&model.EmailCode{}, "id = ? AND user_id = ?", codeID, userID)
		if result.Error != nil {
			return fmt.Errorf("consume email code: %w", result.Error)
		}
		if result.RowsAffected != 1 {
			return fmt.Errorf("email code was already consumed")
		}

		if err := tx.Model(&model.User{}).
			Where("id = ?", userID).
			Updates(map[string]any{
				"token":         token,
				"token_expires": expiresAt,
			}).Error; err != nil {
			return fmt.Errorf("save token: %w", err)
		}
		return nil
	})
}

func (r *UserRepository) DeleteEmailCode(ctx context.Context, codeID string) error {
	if err := r.db.WithContext(ctx).Delete(&model.EmailCode{}, "id = ?", codeID).Error; err != nil {
		return fmt.Errorf("delete email code: %w", err)
	}
	return nil
}
