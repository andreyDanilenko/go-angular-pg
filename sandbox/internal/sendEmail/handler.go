package sendEmail

import (
	"admin/panel/sandbox/internal/sendEmail/dto"
	"admin/panel/sandbox/pkg/request"
	"fmt"
	"net/http"
	"strings"
)

type EmailHandler struct {
	service *EmailService
}

type EmailHandlerDeps struct {
	Service *EmailService
}

func NewEmailHandler(router *http.ServeMux, deps EmailHandlerDeps) {
	handler := &EmailHandler{
		service: deps.Service,
	}

	router.HandleFunc("POST /send/email", handler.SendHandler())
	router.HandleFunc("GET /verify/{hash}", handler.VerifyHandler())
}

func (h *EmailHandler) SendHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := request.HandleBody[dto.EmailRequest](&w, r)
		if err != nil {
			return
		}

		if body.Email == "" {
			http.Error(w, "Email is required", http.StatusBadRequest)
			return
		}

		err = h.service.SendVerificationEmail(body.Email)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to send email: %v", err), http.StatusInternalServerError)
			return
		}

		fmt.Fprintf(w, "Verification email sent to %s", body.Email)
	}
}

func (h *EmailHandler) VerifyHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		hash := strings.TrimPrefix(r.URL.Path, "/verify/")
		if hash == "" {
			http.Error(w, "Hash is required", http.StatusBadRequest)
			return
		}

		if h.service.VerifyHash(hash) {
			fmt.Fprint(w, "true")
		} else {
			fmt.Fprint(w, "false")
		}
	}
}
