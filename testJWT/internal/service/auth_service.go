package service

import (
	"admin/panel/testJWT/internal/model"
	"admin/panel/testJWT/internal/repository"
	"admin/panel/testJWT/internal/utils"
	"context"
	"errors"
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	repo      *repository.UserRepository
	jwtSecret string
}

func NewUserService(repo *repository.UserRepository, jwtSecret string) *UserService {
	return &UserService{
		repo:      repo,
		jwtSecret: jwtSecret,
	}
}

func (s *UserService) Register(ctx context.Context, input model.SignUpInput) (*model.User, string, error) {
	// Проверка существования пользователя
	emailExists, usernameExists, err := s.repo.CheckEmailAndUsername(ctx, input.Email, input.Username)
	if err != nil {
		return nil, "", fmt.Errorf("database error: %w", err)
	}

	if emailExists && usernameExists {
		return nil, "", &model.ConflictError{
			Fields: []model.ConflictField{
				{Field: "email", Message: "Email already registered"},
				{Field: "username", Message: "Username already taken"},
			},
		}
	}

	if emailExists {
		return nil, "", &model.ConflictError{
			Fields: []model.ConflictField{
				{Field: "email", Message: "Email already registered"},
			},
		}
	}

	if usernameExists {
		return nil, "", &model.ConflictError{
			Fields: []model.ConflictField{
				{Field: "username", Message: "Username already taken"},
			},
		}
	}
	// Создание пользователя
	user, err := s.repo.Create(ctx, input)
	if err != nil {
		return nil, "", err
	}

	// Генерация токена
	token, err := utils.Generate(user.ID, s.jwtSecret)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
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
	token, err := utils.Generate(user.ID, s.jwtSecret)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

func (s *UserService) GetProfile(ctx context.Context, userID string) (*model.User, error) {
	return s.repo.GetByID(ctx, userID)
}
