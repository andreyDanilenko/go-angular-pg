package service

import (
	"admin/panel/testJWT/internal/model"
	"admin/panel/testJWT/internal/repository"
	"admin/panel/testJWT/internal/utils"
	"context"
	"errors"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo  *repository.UserRepository
	jwtSecret string
}

func NewAuthService(userRepo *repository.UserRepository, jwtSecret string) *AuthService {
	return &AuthService{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
	}
}

func (s *AuthService) SignUp(ctx context.Context, input model.SignUpInput) (*model.User, string, error) {
	existingUser, err := s.userRepo.GetUserByEmail(ctx, input.Email)
	if err != nil {
		return nil, "", err
	}
	if existingUser != nil {
		return nil, "", errors.New("user with this email already exists")
	}

	user, err := s.userRepo.CreateUser(ctx, input)
	if err != nil {
		return nil, "", err
	}

	token, err := utils.Generate(user.ID, s.jwtSecret) // Теперь типы совместимы
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

func (s *AuthService) SignIn(ctx context.Context, input model.SignInInput) (*model.User, string, error) {
	user, err := s.userRepo.GetUserByEmail(ctx, input.Email)
	if err != nil {
		return nil, "", err
	}
	if user == nil {
		return nil, "", errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return nil, "", errors.New("invalid credentials")
	}

	token, err := utils.Generate(user.ID, s.jwtSecret)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}
