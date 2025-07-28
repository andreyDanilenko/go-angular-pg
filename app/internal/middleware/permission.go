package middleware

import (
	"admin/panel/internal/contract"
	"admin/panel/internal/model"
	"net/http"
)

func HasPermission(permission model.Permission, errorWriter contract.ErrorWriter) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role, ok := r.Context().Value(RoleKey).(model.UserRole)
			if !ok {
				errorWriter.WriteError(w, http.StatusUnauthorized, "Role information missing")
				return
			}

			permissions, exists := model.RolePermissions[role]
			if !exists {
				errorWriter.WriteError(w, http.StatusForbidden, "Unknown role")
				return
			}

			hasPermission := false
			for _, p := range permissions {
				if p == permission {
					hasPermission = true
					break
				}
			}

			if !hasPermission {
				errorWriter.WriteError(w, http.StatusForbidden, "Insufficient permissions")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
