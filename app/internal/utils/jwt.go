package utils

import (
	"admin/panel/internal/contract"
	"admin/panel/internal/model"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWTManager struct {
	secret string
}

func NewJWTManager(secret string) contract.TokenManager {
	return &JWTManager{secret: secret}
}

func (j *JWTManager) Generate(userID string, role model.UserRole, ttl time.Duration) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  userID,
		"role": string(role),
		"exp":  time.Now().Add(ttl).Unix(),
		"iat":  time.Now().Unix(),
	})

	return token.SignedString([]byte(j.secret))
}

func (j *JWTManager) Extract(tokenString string) (string, model.UserRole, error) {
	claims, err := j.parse(tokenString)
	if err != nil {
		return "", "", err
	}

	userID, ok := claims["sub"].(string)
	if !ok || userID == "" {
		return "", "", errors.New("invalid user ID in token")
	}

	roleStr, _ := claims["role"].(string)
	role := model.UserRole(roleStr)
	if !role.IsValid() {
		role = model.RoleGuest
	}

	return userID, role, nil
}

func (j *JWTManager) parse(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(j.secret), nil
	})

	if err != nil || !token.Valid {
		return nil, errors.New("invalid or expired token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid claims structure")
	}

	return claims, nil
}
