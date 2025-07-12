package middleware

import (
	"admin/panel/testJWT/internal/utils"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

func JWTAuth(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenString := extractToken(r)
			if tokenString == "" {
				respondError(w, http.StatusUnauthorized, "Authorization token required")
				return
			}

			userID, err := utils.Parse(tokenString, secret)
			if err != nil {
				respondError(w, http.StatusUnauthorized, fmt.Sprintf("Invalid token: %v", err))
				return
			}

			ctx := context.WithValue(r.Context(), "userID", userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		},
		)
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
