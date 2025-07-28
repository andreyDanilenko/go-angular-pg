package middleware

import (
	"admin/panel/internal/contract"
	"admin/panel/internal/model"
	"context"
	"errors"
	"net/http"
)

func RequireAnyPermission(permissions []model.Permission, errorWriter contract.ErrorWriter) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role, err := getRoleFromContext(r.Context())
			if err != nil {
				errorWriter.WriteError(w, http.StatusForbidden, "Role not found")
				return
			}

			// Проверяем наличие хотя бы одного из требуемых прав
			if hasAnyPermission(role, permissions) {
				next.ServeHTTP(w, r)
				return
			}

			errorWriter.WriteError(w, http.StatusForbidden, "Insufficient permissions")
		})
	}
}

func getRoleFromContext(ctx context.Context) (model.UserRole, error) {
	role, ok := ctx.Value(RoleKey).(model.UserRole)
	if !ok {
		return "", ErrRoleNotFound
	}
	return role, nil
}

func hasAnyPermission(role model.UserRole, requiredPermissions []model.Permission) bool {
	rolePermissions, ok := model.RolePermissions[role]
	if !ok {
		return false
	}

	permissionSet := make(map[model.Permission]struct{}, len(requiredPermissions))
	for _, p := range requiredPermissions {
		permissionSet[p] = struct{}{}
	}

	for _, p := range rolePermissions {
		if _, exists := permissionSet[p]; exists {
			return true
		}
	}

	return false
}

var ErrRoleNotFound = errors.New("role not found in context")
