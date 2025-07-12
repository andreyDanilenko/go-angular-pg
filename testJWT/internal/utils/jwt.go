package utils

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// GenerateToken создает новый JWT токен для пользователя
func Generate(userID uint, secret string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(time.Hour * 24).Unix(),
		"iat": time.Now().Unix(),
	})

	return token.SignedString([]byte(secret))
}

// ParseToken проверяет и парсит JWT токен, возвращает ID пользователя
func Parse(tokenString string, secret string) (int64, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Проверяем метод подписи
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(secret), nil
	})

	if err != nil {
		return 0, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// Проверяем expiration claim
		exp, err := claims.GetExpirationTime()
		if err != nil || exp.Before(time.Now()) {
			return 0, jwt.ErrTokenExpired
		}

		// Получаем subject claim (user ID)
		sub, err := claims.GetSubject()
		if err != nil {
			return 0, err
		}

		// Конвертируем string в int64
		userID := int64(0)
		_, err = fmt.Sscan(sub, &userID)
		if err != nil {
			return 0, err
		}

		return userID, nil
	}

	return 0, jwt.ErrTokenInvalidClaims
}
