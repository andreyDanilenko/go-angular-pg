package utils

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// GenerateToken создает новый JWT токен для пользователя
func Generate(userID string, secret string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": userID, // Преобразуем uint в string
		"exp": time.Now().Add(time.Hour * 24).Unix(),
		"iat": time.Now().Unix(),
	})

	return token.SignedString([]byte(secret))
}

// ParseToken проверяет и парсит JWT токен, возвращает claims или ошибку
func Parse(tokenString, secret string) (jwt.MapClaims, error) {
	// Проверка на пустой токен
	if tokenString == "" {
		return nil, fmt.Errorf("empty token string")
	}

	// Парсинг токена с проверкой подписи
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Проверяем алгоритм подписи
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	// Обработка ошибок парсинга
	if err != nil {
		switch {
		case errors.Is(err, jwt.ErrTokenMalformed):
			return nil, fmt.Errorf("malformed token")
		case errors.Is(err, jwt.ErrTokenExpired):
			return nil, fmt.Errorf("token expired")
		case errors.Is(err, jwt.ErrTokenNotValidYet):
			return nil, fmt.Errorf("token not active yet")
		default:
			return nil, fmt.Errorf("token parsing error: %w", err)
		}
	}

	// Проверка валидности токена и claims
	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, fmt.Errorf("invalid token claims format")
	}

	// Дополнительная проверка наличия обязательных claims
	if _, ok := claims["sub"]; !ok {
		return nil, fmt.Errorf("missing sub claim")
	}

	return claims, nil
}
