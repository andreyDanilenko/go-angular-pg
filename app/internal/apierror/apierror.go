package apierror

import (
	"encoding/json"
	"log"
	"net/http"
)

type ErrorResponse struct {
	Code      int         `json:"code"`
	ErrorCode string      `json:"error_code"`
	Message   string      `json:"message"`
	Details   interface{} `json:"details,omitempty"`
}

type Writer struct{}

func New() *Writer {
	return &Writer{}
}

func (w *Writer) WriteError(rw http.ResponseWriter, statusCode int, message string) {
	w.WriteWithCode(rw, statusCode, http.StatusText(statusCode), message, nil)
}

func (w *Writer) WriteWithCode(rw http.ResponseWriter, statusCode int, errorCode, message string, details interface{}) {
	if statusCode >= 500 {
		log.Printf("internal error: %s", message)
	}

	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(statusCode)

	_ = json.NewEncoder(rw).Encode(ErrorResponse{
		Code:      statusCode,
		ErrorCode: errorCode,
		Message:   message,
		Details:   details,
	})
}
