package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"admin/panel/internal/contract"
	"admin/panel/internal/middleware"
	"admin/panel/internal/model"
	"admin/panel/internal/service"

	"github.com/go-playground/validator/v10"
)

type UserHandler struct {
	service        *service.UserService
	validator      *validator.Validate
	errorWriter    contract.ErrorWriter
	responseWriter contract.ResponseWriter
}

func NewUserHandler(
	service *service.UserService,
	errorWriter contract.ErrorWriter,
	responseWriter contract.ResponseWriter,
) *UserHandler {
	return &UserHandler{
		service:        service,
		validator:      validator.New(),
		errorWriter:    errorWriter,
		responseWriter: responseWriter,
	}
}

func (h *UserHandler) StartAuthFlow(w http.ResponseWriter, r *http.Request) {
	var input model.SignInInput
	if !h.decodeAndValidate(w, r, &input) {
		return
	}
	if err := h.service.StartAuthFlow(r.Context(), input); err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) {
			h.errorWriter.WriteWithCode(w, http.StatusUnauthorized, "invalid_credentials", "Неверный email или пароль", nil)
			return
		}
		h.errorWriter.WriteError(w, http.StatusInternalServerError, "Не удалось отправить код")
		return
	}
	h.responseWriter.WriteJSON(w, http.StatusAccepted, map[string]string{"message": "Код отправлен на email"})
}

func (h *UserHandler) ConfirmCode(w http.ResponseWriter, r *http.Request) {
	var input model.ConfirmCodeInput
	if !h.decodeAndValidate(w, r, &input) {
		return
	}
	token, err := h.service.ConfirmCode(r.Context(), input.Email, input.Code)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCode) {
			h.errorWriter.WriteWithCode(w, http.StatusUnauthorized, "invalid_code", "Код недействителен или истёк", nil)
			return
		}
		h.errorWriter.WriteError(w, http.StatusInternalServerError, "Не удалось подтвердить код")
		return
	}
	h.responseWriter.WriteJSON(w, http.StatusOK, map[string]string{"token": token})
}

func (h *UserHandler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserID(r.Context())
	if !ok {
		h.errorWriter.WriteError(w, http.StatusUnauthorized, "Требуется авторизация")
		return
	}
	user, err := h.service.GetCurrentUser(r.Context(), userID)
	if err != nil {
		if errors.Is(err, service.ErrUserNotFound) {
			h.errorWriter.WriteError(w, http.StatusNotFound, "Пользователь не найден")
			return
		}
		h.errorWriter.WriteError(w, http.StatusInternalServerError, "Не удалось загрузить профиль")
		return
	}
	h.responseWriter.WriteJSON(w, http.StatusOK, user)
}

func (h *UserHandler) UpdateCurrentUser(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserID(r.Context())
	if !ok {
		h.errorWriter.WriteError(w, http.StatusUnauthorized, "Требуется авторизация")
		return
	}
	var input model.UpdateUserInput
	if !h.decodeAndValidate(w, r, &input) {
		return
	}
	user, err := h.service.UpdateCurrentUser(r.Context(), userID, input)
	if err != nil {
		h.errorWriter.WriteError(w, http.StatusInternalServerError, "Не удалось обновить профиль")
		return
	}
	h.responseWriter.WriteJSON(w, http.StatusOK, user)
}

func (h *UserHandler) decodeAndValidate(w http.ResponseWriter, r *http.Request, destination any) bool {
	decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(destination); err != nil {
		h.errorWriter.WriteWithCode(w, http.StatusBadRequest, "invalid_body", "Неверный формат запроса", nil)
		return false
	}
	if err := h.validator.Struct(destination); err != nil {
		h.errorWriter.WriteWithCode(w, http.StatusBadRequest, "validation_failed", "Проверьте заполнение полей", nil)
		return false
	}
	return true
}
