package utils

import (
	"admin/panel/internal/model"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// GenerateToken создает новый JWT токен для пользователя
func Generate(userID string, role model.UserRole, secret string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  userID,
		"role": string(role),
		"exp":  time.Now().Add(time.Hour * 24).Unix(),
		"iat":  time.Now().Unix(),
	})

	return token.SignedString([]byte(secret))
}
