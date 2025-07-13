package middleware

import (
	"admin/panel/testJWT/internal/utils"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

func JWTAuth(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenString := extractToken(r)
			if tokenString == "" {
				respondError(w, http.StatusUnauthorized, "Authorization token required")
				return
			}

			// Получаем claims из токена
			claims, err := utils.Parse(tokenString, secret)
			if err != nil {
				respondError(w, http.StatusUnauthorized, fmt.Sprintf("Invalid token: %v", err))
				return
			}

			// Извлекаем userID из claims
			userID, err := extractUserIDFromClaims(claims)
			if err != nil {
				respondError(w, http.StatusUnauthorized, "Invalid user ID in token")
				return
			}

			// Сохраняем в контекст как uint
			ctx := context.WithValue(r.Context(), "userID", userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func extractUserIDFromClaims(claims jwt.MapClaims) (uint, error) {
	// Проверяем наличие sub claim
	sub, ok := claims["sub"]
	if !ok {
		return 0, errors.New("sub claim missing")
	}

	// Обрабатываем разные форматы sub (string или float64)
	switch v := sub.(type) {
	case string:
		id, err := strconv.ParseUint(v, 10, 64)
		if err != nil {
			return 0, fmt.Errorf("invalid sub format: %v", err)
		}
		return uint(id), nil
	case float64:
		return uint(v), nil
	default:
		return 0, fmt.Errorf("unexpected sub type: %T", sub)
	}
}

func extractToken(r *http.Request) string {
	bearerToken := r.Header.Get("Authorization")
	if strings.HasPrefix(bearerToken, "Bearer ") {
		return strings.TrimPrefix(bearerToken, "Bearer ")
	}
	return ""
}

func respondError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}
