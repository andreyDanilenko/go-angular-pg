package request

import (
	"admin/panel/pkg/response"
	"fmt"
	"net/http"
)

func HandleBody[T any](w *http.ResponseWriter, r *http.Request) (*T, error) {
	// 1. Декодируем тело запроса
	body, err := Decode[T](r.Body)

	fmt.Println(body)
	if err != nil {
		response.Json(*w, err.Error(), 422)
		return nil, err
	}

	// 2. Валидация данных из тела
	err = IsValid(body)
	if err != nil {
		response.Json(*w, err.Error(), 422)
		return nil, err
	}
	fmt.Println(body)

	return &body, nil
}
