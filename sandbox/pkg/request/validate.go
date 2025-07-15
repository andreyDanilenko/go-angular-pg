package request

import (
	"github.com/go-playground/validator"
)

func IsValid[T any](body T) error {
	validation := validator.New()

	// Для кастомных валидаций
	// validate := validator.New()
	// if err := validate.RegisterValidation("first_name", firstNameValidation); err != nil {
	// 	log.Fatal("Failed to register validation:", err)
	// }

	return validation.Struct(body)
}
