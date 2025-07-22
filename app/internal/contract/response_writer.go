package contract

import "net/http"

type ResponseWriter interface {
	WriteJSON(w http.ResponseWriter, statusCode int, data interface{})
}
