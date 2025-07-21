package middleware

import (
	"admin/panel/internal/contract"
	"admin/panel/internal/model"
	"context"
	"errors"

	"fmt"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const (
	UserIDKey contextKey = "userID"
	RoleKey   contextKey = "role"
)

func JWTFromQuery(secret string, errorWriter contract.ErrorWriter) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenString := r.URL.Query().Get("token")
			if tokenString == "" {
				errorWriter.WriteError(w, http.StatusUnauthorized, "Missing token in query")
				return
			}

			claims, err := ParseToken(tokenString, secret)
			if err != nil {
				errorWriter.WriteError(w, http.StatusUnauthorized, fmt.Sprintf("Invalid token: %v", err))
				return
			}

			userID, ok := claims["sub"].(string)
			if !ok || userID == "" {
				errorWriter.WriteError(w, http.StatusUnauthorized, "Invalid user ID in token")
				return
			}

			roleStr, _ := claims["role"].(string)
			role := model.UserRole(roleStr)
			if !role.IsValid() {
				role = model.RoleGuest
			}

			ctx := context.WithValue(r.Context(), UserIDKey, userID)
			ctx = context.WithValue(ctx, RoleKey, role)

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func JWTAuth(secret string, errorWriter contract.ErrorWriter) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if !strings.HasPrefix(authHeader, "Bearer ") {
				errorWriter.WriteError(w, http.StatusUnauthorized, "Missing or invalid Authorization header")
				return
			}

			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			if tokenString == "" {
				errorWriter.WriteError(w, http.StatusUnauthorized, "Authorization token required")
				return
			}

			claims, err := ParseToken(tokenString, secret)
			if err != nil {
				errorWriter.WriteError(w, http.StatusUnauthorized, fmt.Sprintf("Invalid token: %v", err))
				return
			}

			userID, ok := claims["sub"].(string)
			if !ok || userID == "" {
				errorWriter.WriteError(w, http.StatusUnauthorized, "Invalid user ID in token")
				return
			}

			roleStr, _ := claims["role"].(string)
			role := model.UserRole(roleStr)
			if !role.IsValid() {
				role = model.RoleGuest
			}

			ctx := context.WithValue(r.Context(), UserIDKey, userID)
			ctx = context.WithValue(ctx, RoleKey, role)

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func ParseToken(tokenString, secret string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}
