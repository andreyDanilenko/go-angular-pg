package service

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"log/slog"
	"math/big"
	"time"

	"admin/panel/internal/contract"
	"admin/panel/internal/model"
	"admin/panel/internal/repository"

	"golang.org/x/crypto/bcrypt"
)

const (
	verificationCodeTTL = 2 * time.Minute
	tokenTTL            = 30 * 24 * time.Hour
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrInvalidCode        = errors.New("invalid or expired code")
	ErrUserNotFound       = errors.New("user not found")
)

type NotificationQueue interface {
	EnqueueAuthRequest(ctx context.Context, code *model.EmailCode, email string) error
	EnqueueTelegram(ctx context.Context, kind, idempotencyKey, message string) error
}

type UserService struct {
	repository        *repository.UserRepository
	notificationQueue NotificationQueue
	tokenManager      contract.TokenManager
	logger            *slog.Logger
}

func NewUserService(
	repository *repository.UserRepository,
	notificationQueue NotificationQueue,
	tokenManager contract.TokenManager,
	logger *slog.Logger,
) *UserService {
	return &UserService{
		repository:        repository,
		notificationQueue: notificationQueue,
		tokenManager:      tokenManager,
		logger:            logger,
	}
}

func (s *UserService) StartAuthFlow(
	ctx context.Context,
	input model.SignInInput,
) error {
	user, err := s.repository.GetByEmail(ctx, input.Email)
	if err != nil {
		return err
	}
	if user == nil {
		user, err = s.repository.Create(ctx, input)
		if err != nil {
			return err
		}
	} else if err := bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(input.Password),
	); err != nil {
		return ErrInvalidCredentials
	}

	code, err := generateVerificationCode()
	if err != nil {
		return fmt.Errorf("generate verification code: %w", err)
	}
	emailCode := &model.EmailCode{
		UserID:    user.ID,
		Code:      code,
		ExpiresAt: time.Now().UTC().Add(verificationCodeTTL),
	}
	if err := s.notificationQueue.EnqueueAuthRequest(ctx, emailCode, user.Email); err != nil {
		return fmt.Errorf("queue verification code: %w", err)
	}
	return nil
}

func (s *UserService) ConfirmCode(
	ctx context.Context,
	email string,
	code string,
) (string, error) {
	user, err := s.repository.GetByEmail(ctx, email)
	if err != nil {
		return "", err
	}
	if user == nil {
		return "", ErrInvalidCode
	}

	storedCode, err := s.repository.GetEmailCode(ctx, user.ID, code)
	if err != nil {
		return "", err
	}
	if storedCode == nil || time.Now().UTC().After(storedCode.ExpiresAt) {
		if storedCode != nil {
			_ = s.repository.DeleteEmailCode(ctx, storedCode.ID)
		}
		return "", ErrInvalidCode
	}

	expiresAt := time.Now().UTC().Add(tokenTTL)
	token, err := s.tokenManager.Generate(user.ID, user.Role, tokenTTL)
	if err != nil {
		return "", fmt.Errorf("generate token: %w", err)
	}
	if err := s.repository.ConsumeCodeAndSaveToken(
		ctx,
		storedCode.ID,
		user.ID,
		token,
		expiresAt,
	); err != nil {
		return "", err
	}

	if err := s.notificationQueue.EnqueueTelegram(
		ctx,
		"auth_confirmed",
		"auth-confirmed:"+storedCode.ID,
		fmt.Sprintf("✅ Успешная авторизация\nEmail: %s\nID: %s", user.Email, user.ID),
	); err != nil {
		s.logger.Error("failed to queue Telegram auth notification", "user_id", user.ID, "error", err)
	}

	return token, nil
}

func (s *UserService) GetCurrentUser(ctx context.Context, userID string) (*model.User, error) {
	user, err := s.repository.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (s *UserService) UpdateCurrentUser(
	ctx context.Context,
	userID string,
	input model.UpdateUserInput,
) (*model.User, error) {
	user, err := s.repository.Update(ctx, userID, input)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func generateVerificationCode() (string, error) {
	number, err := rand.Int(rand.Reader, big.NewInt(1_000_000))
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", number.Int64()), nil
}
