package request

import (
	"github.com/go-playground/validator"
)

func IsValid[T any](payload T) error {
	validation := validator.New()
	return validation.Struct(payload)
}
