package contract

import (
	"admin/panel/internal/model"
	"time"
)

type TokenManager interface {
	Generate(userID string, role model.UserRole, ttl time.Duration) (string, error)
	Extract(tokenString string) (userID string, role model.UserRole, err error)
}
