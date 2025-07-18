package errors

import (
	"encoding/json"
	"net/http"
)

type ErrorResponse struct {
	Code      int    `json:"code"`
	ErrorCode string `json:"error_code"`
	Message   string `json:"message"`
}

func New(code int, errorCode, message string) ErrorResponse {
	return ErrorResponse{
		Code:      code,
		ErrorCode: errorCode,
		Message:   message,
	}
}

func Write(w http.ResponseWriter, err ErrorResponse) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(err.Code)
	json.NewEncoder(w).Encode(err)
}
