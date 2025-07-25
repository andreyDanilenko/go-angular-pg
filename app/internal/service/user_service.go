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

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
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

func (s *UserService) Register(ctx context.Context, input model.SignUpInput) (*model.User, error) {
	// Проверка существования пользователя
	emailExists, usernameExists, err := s.repo.CheckEmailAndUsername(ctx, input.Email, input.Username)
	if err != nil {
		return nil, fmt.Errorf("database error: %w", err)
	}

	if emailExists && usernameExists {
		return nil, &model.ConflictError{
			Fields: []model.ConflictField{
				{Field: "email", Message: "Email already registered"},
				{Field: "username", Message: "Username already taken"},
			},
		}
	}

	if emailExists {
		return nil, &model.ConflictError{
			Fields: []model.ConflictField{
				{Field: "email", Message: "Email already registered"},
			},
		}
	}

	if usernameExists {
		return nil, &model.ConflictError{
			Fields: []model.ConflictField{
				{Field: "username", Message: "Username already taken"},
			},
		}
	}
	// Создание пользователя
	user, err := s.repo.Create(ctx, input)
	if err != nil {
		return nil, err
	}

	confirmationToken := uuid.NewString()
	confirmation := &model.EmailConfirmation{
		UserID:    user.ID,
		Token:     confirmationToken,
		Purpose:   "register",
		ExpiresAt: time.Now().Add(15 * time.Minute),
	}

	err = s.repo.SaveEmailConfirmation(ctx, confirmation)
	if err != nil {
		return nil, fmt.Errorf("failed to save confirmation token: %w", err)
	}

	go s.emailService.SendEmail(user.Email, confirmationToken)

	// // Генерация токена
	// token, err := s.tokenManager.Generate(user.ID, user.Role, time.Hour*24)
	// if err != nil {
	// 	return nil, "", err
	// }
	// return user, token, nil
	return user, nil
}

func (s *UserService) Login(ctx context.Context, input model.SignInInput) (*model.User, string, error) {
	// Получение пользователя
	user, err := s.repo.GetByEmail(ctx, input.Email)
	if err != nil {
		return nil, "", err
	}
	if user == nil {
		return nil, "", errors.New("user not found")
	}

	// Проверка пароля
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return nil, "", errors.New("wrong password")
	}

	// Генерация токена
	token, err := s.tokenManager.Generate(user.ID, user.Role, time.Hour*24)
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
		})
	}
	return shortUsers, nil
}

// Получение полного пользователя по ID
func (s *UserService) GetUserByID(ctx context.Context, id string) (*model.User, error) {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("user not found")
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

func (s *UserService) UpdateUser(ctx context.Context, userID string, input model.UpdateUserInput) (*model.User, error) {
	authUserID := ctx.Value(middleware.UserIDKey).(string)
	role := ctx.Value(middleware.RoleKey).(model.UserRole)

	if authUserID != userID && role != model.RoleAdmin {
		return nil, errors.New("нельзя редактировать другого пользователя")
	}

	// Если админ, разрешаем менять роль
	if role == model.RoleAdmin {
		if input.Role != "" {
			if !model.UserRole(input.Role).IsValid() {
				return nil, errors.New("недопустимая роль")
			}
		}
	} else {
		// Обычный пользователь не может менять роль
		input.Role = "" // или игнорируем роль из input
	}

	return s.repo.UpdateUser(ctx, userID, input)
}
