package service

import (
	"admin/panel/internal/contract"
	"admin/panel/internal/middleware"
	"admin/panel/internal/model"
	"admin/panel/internal/repository"
	"context"
	"errors"
	"fmt"
	"time"

	"math/rand/v2"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserService struct {
	repo         *repository.UserRepository
	emailService *EmailService
	tokenManager contract.TokenManager
}

func NewUserService(repo *repository.UserRepository, emailService *EmailService, tokenManager contract.TokenManager) *UserService {
	return &UserService{
		repo:         repo,
		emailService: emailService,
		tokenManager: tokenManager,
	}
}

func (s *UserService) StartAuthFlow(ctx context.Context, input model.SignInInput) (*model.User, error) {
	user, err := s.repo.GetByEmail(ctx, input.Email)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("failed to check user existence: %w", err)
	}

	if user == nil {
		user, err = s.repo.Create(ctx, model.SignInInput{
			Email:    input.Email,
			Password: input.Password,
		})
		if err != nil {
			return nil, fmt.Errorf("failed to create user: %w", err)
		}
	} else {
		// Пользователь есть — сверяем пароль
		if err := bcrypt.CompareHashAndPassword(
			[]byte(user.Password),
			[]byte(input.Password),
		); err != nil {
			return nil, errors.New("invalid password")
		}
	}

	// 4. Генерация и отправка кода (без изменений)
	_ = s.repo.DeleteExistingEmailCodes(ctx, user.ID)
	code := fmt.Sprintf("%06d", rand.IntN(1000000))

	err = s.repo.SaveEmailCode(ctx, &model.EmailCode{
		ID:        uuid.NewString(),
		UserID:    user.ID,
		Code:      code,
		ExpiresAt: time.Now().Add(2 * time.Minute),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to save verification code: %w", err)
	}

	go s.emailService.SendEmail(user.Email, code)

	return user, nil
}

func (s *UserService) ConfirmCode(ctx context.Context, email, code string) (*model.User, string, error) {
	user, err := s.repo.GetByEmail(ctx, email)
	if err != nil || user == nil {
		return nil, "", errors.New("user not found from email")
	}

	storedCode, err := s.repo.GetEmailCode(ctx, user.ID, code)
	if err != nil || storedCode == nil {
		return nil, "", errors.New("invalid or expired code")
	}

	if time.Now().After(storedCode.ExpiresAt) {
		_ = s.repo.DeleteEmailCode(ctx, storedCode.ID)
		return nil, "", errors.New("code expired")
	}

	_ = s.repo.DeleteEmailCode(ctx, storedCode.ID)
	token, err := s.tokenManager.Generate(user.ID, user.Role, 3*time.Hour)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

// Получение списка пользователей
func (s *UserService) GetUsers(ctx context.Context) ([]model.UserShort, error) {
	users, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	shortUsers := make([]model.UserShort, 0, len(users))
	for _, u := range users {
		shortUsers = append(shortUsers, model.UserShort{
			ID:        u.ID,
			Username:  u.Username,
			FirstName: u.FirstName,
			LastName:  u.LastName,
			Email:     u.Email,
			Role:      u.Role,
		})
	}
	return shortUsers, nil
}

func (s *UserService) GetUserMe(ctx context.Context, id string) (*model.User, error) {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("user not found from me ID")
	}

	fullUser := &model.User{
		ID:         user.ID,
		Username:   user.Username,
		FirstName:  user.FirstName,
		LastName:   user.LastName,
		MiddleName: user.MiddleName,
		Role:       user.Role,
		Email:      user.Email,
		CreatedAt:  user.CreatedAt,
		UpdatedAt:  user.UpdatedAt,
	}

	return fullUser, nil
}

// Получение полного пользователя по ID
func (s *UserService) GetUserByID(ctx context.Context, id string) (*model.User, error) {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("user not found from by ID")
	}

	// Тут надо будет минимизтировать информацию так как это будет для всех
	fullUser := &model.User{
		ID:         user.ID,
		Username:   user.Username,
		FirstName:  user.FirstName,
		LastName:   user.LastName,
		MiddleName: user.MiddleName,
		Role:       user.Role,
		CreatedAt:  user.CreatedAt,
		UpdatedAt:  user.UpdatedAt,
	}

	return fullUser, nil
}

func (s *UserService) UpdateUser(ctx context.Context, userID string, input model.UpdateUserInput) (*model.User, error) {
	authUserID := ctx.Value(middleware.UserIDKey).(string)
	role := ctx.Value(middleware.RoleKey).(model.UserRole)

	if authUserID != userID && role != model.RoleAdmin {
		return nil, errors.New("нельзя редактировать другого пользователя")
	}

	if role == model.RoleAdmin {
		if input.Role != "" {
			if !model.UserRole(input.Role).IsValid() {
				return nil, errors.New("недопустимая роль")
			}
		}
	} else {
		input.Role = ""
	}

	return s.repo.UpdateUser(ctx, userID, input)
}
