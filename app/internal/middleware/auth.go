package middleware

import (
	"context"
	"net/http"
	"strings"

	"admin/panel/internal/contract"
	"admin/panel/internal/model"
)

type contextKey string

const (
	userIDKey contextKey = "userID"
	roleKey   contextKey = "role"
)

func JWTAuth(
	tokenManager contract.TokenManager,
	errorWriter contract.ErrorWriter,
) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authorization := r.Header.Get("Authorization")
			token, found := strings.CutPrefix(authorization, "Bearer ")
			if !found || strings.TrimSpace(token) == "" {
				errorWriter.WriteError(w, http.StatusUnauthorized, "Требуется авторизация")
				return
			}

			userID, role, err := tokenManager.Extract(token)
			if err != nil {
				errorWriter.WriteError(w, http.StatusUnauthorized, "Сессия недействительна")
				return
			}

			ctx := context.WithValue(r.Context(), userIDKey, userID)
			ctx = context.WithValue(ctx, roleKey, role)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func UserID(ctx context.Context) (string, bool) {
	userID, ok := ctx.Value(userIDKey).(string)
	return userID, ok && userID != ""
}

func Role(ctx context.Context) (model.UserRole, bool) {
	role, ok := ctx.Value(roleKey).(model.UserRole)
	return role, ok
}
