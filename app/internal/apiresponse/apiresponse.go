package apiresponse

import (
	"encoding/json"
	"net/http"

	"admin/panel/internal/contract"
)

type writer struct{}

func New() contract.ResponseWriter {
	return &writer{}
}

func (w *writer) WriteJSON(res http.ResponseWriter, statusCode int, data interface{}) {
	res.Header().Set("Content-Type", "application/json")
	res.WriteHeader(statusCode)
	_ = json.NewEncoder(res).Encode(data)
}
