package sendEmail

import (
	"admin/panel/sandbox/configs"
	"net/http"
)

func Setup(router *http.ServeMux, config *configs.Config) {
	repo := NewRepository("storage.json")
	service := NewEmailService(config, repo)

	NewEmailHandler(router, EmailHandlerDeps{
		Service: service,
	})
}
