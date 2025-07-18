package contract

import "net/http"

type ErrorWriter interface {
	WriteError(w http.ResponseWriter, statusCode int, message string)
	WriteWithCode(w http.ResponseWriter, statusCode int, errorCode, message string, details interface{})
}
