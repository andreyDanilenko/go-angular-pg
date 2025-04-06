package request

import (
	"admin/panel/pkg/response"
	"net/http"
)

func HandleBody[T any](w *http.ResponseWriter, req *http.Request) (*T, error) {
	// 1. Декодируем тело запроса
	body, err := Decode[T](req.Body)
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

	return &body, nil
}
