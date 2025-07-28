package middleware

import (
	"admin/panel/internal/contract"
	"admin/panel/internal/model"
	"net/http"
)

func RequireAnyPermission(permissions []model.Permission, errorWriter contract.ErrorWriter) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role := r.Context().Value(RoleKey).(model.UserRole)
			if role == "" {
				errorWriter.WriteError(w, http.StatusForbidden, "Role not found")
				return
			}

			if !hasAnyPermission(role, permissions) {
				errorWriter.WriteError(w, http.StatusForbidden, "Insufficient permissions")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func hasAnyPermission(role model.UserRole, required []model.Permission) bool {
	rolePerms := model.RolePermissions[role]
	for _, rp := range rolePerms {
		for _, p := range required {
			if rp == p {
				return true
			}
		}
	}
	return false
}
