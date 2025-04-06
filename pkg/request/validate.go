package request

import (
	"github.com/go-playground/validator"
)

func IsValid[T any](body T) error {
	validation := validator.New()
	return validation.Struct(body)
}
