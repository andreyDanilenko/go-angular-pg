package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"admin/panel/internal/contract"
	"admin/panel/internal/middleware"
	"admin/panel/internal/model"
	"admin/panel/internal/service"

	"github.com/go-chi/chi/v5"
	"github.com/go-playground/validator/v10"
)

type UserHandler struct {
	authService  *service.UserService
	validate     *validator.Validate
	errorWriter  contract.ErrorWriter
	responseJSON contract.ResponseWriter
}

func NewUserHandler(
	authService *service.UserService,
	ew contract.ErrorWriter,
	rw contract.ResponseWriter,
) *UserHandler {
	return &UserHandler{
		authService:  authService,
		validate:     validator.New(),
		errorWriter:  ew,
		responseJSON: rw,
	}
}

func (h *UserHandler) SignUp(w http.ResponseWriter, r *http.Request) {
	var input model.SignUpInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		h.errorWriter.WriteWithCode(w, http.StatusBadRequest, "bad_request", "Некорректный формат данных", nil)
		return
	}

	if err := h.validate.Struct(input); err != nil {
		h.errorWriter.WriteWithCode(w, http.StatusBadRequest, "validation_failed", "Ошибка валидации", err)
		return
	}

	user, err := h.authService.Register(r.Context(), input)
	if err != nil {
		var conflictErr *model.ConflictError
		if errors.As(err, &conflictErr) {
			h.errorWriter.WriteWithCode(
				w,
				http.StatusConflict,
				"conflict",
				"Указанные поля уже заняты",
				conflictErr.Fields,
			)
			return
		}
		h.errorWriter.WriteError(w, http.StatusInternalServerError, "Внутренняя ошибка сервера")
		return
	}

	h.responseJSON.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Регистрация прошла успешно. Проверьте email для подтверждения.",
		"user":    user,
	})
}

func (h *UserHandler) SignIn(w http.ResponseWriter, r *http.Request) {
	var input model.SignInInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		h.errorWriter.WriteWithCode(w, http.StatusBadRequest, "bad_request", "Некорректный формат данных", nil)
		return
	}

	if err := h.validate.Struct(input); err != nil {
		h.errorWriter.WriteWithCode(w, http.StatusBadRequest, "validation_failed", "Ошибка валидации", err)
		return
	}

	user, token, err := h.authService.Login(r.Context(), input)
	if err != nil {
		h.errorWriter.WriteWithCode(w, http.StatusUnauthorized, "unauthorized", "Неверный email или пароль", nil)
		return
	}

	h.responseJSON.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"user":  user,
		"token": token,
	})
}

func (h *UserHandler) GetUsers(w http.ResponseWriter, r *http.Request) {
	users, err := h.authService.GetUsers(r.Context())
	if err != nil {
		h.errorWriter.WriteError(w, http.StatusInternalServerError, "Не удалось получить пользователей")
		return
	}

	h.responseJSON.WriteJSON(w, http.StatusOK, users)
}

func (h *UserHandler) GetUserByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	user, err := h.authService.GetUserByID(r.Context(), id)
	if err != nil {
		h.errorWriter.WriteWithCode(w, http.StatusNotFound, "not_found", "Пользователь не найден", nil)
		return
	}

	h.responseJSON.WriteJSON(w, http.StatusOK, user)
}

func (h *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "id")

	authUserID, _ := r.Context().Value(middleware.UserIDKey).(string)
	role, _ := r.Context().Value(middleware.RoleKey).(model.UserRole)

	if authUserID != userID && role != model.RoleAdmin {
		h.errorWriter.WriteWithCode(w, http.StatusForbidden, "forbidden", "Другого пользователя может редактировать только администратор", nil)
		return
	}

	var input model.UpdateUserInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		h.errorWriter.WriteWithCode(w, http.StatusBadRequest, "invalid_body", "Неверный формат запроса", nil)
		return
	}

	user, err := h.authService.UpdateUser(r.Context(), userID, input)
	if err != nil {
		h.errorWriter.WriteError(w, http.StatusInternalServerError, "Не удалось обновить пользователя")
		return
	}

	h.responseJSON.WriteJSON(w, http.StatusOK, user)
}

// func (h *UserHandler) VerifyEmail(w http.ResponseWriter, r *http.Request) {
// 	token := r.URL.Query().Get("token")
// 	if token == "" {
// 		h.errorWriter.WriteWithCode(w, http.StatusBadRequest, "bad_request", "Нет токена", nil)
// 		return
// 	}

// 	err := h.authService.VerifyEmailToken(r.Context(), token)
// 	if err != nil {
// 		h.errorWriter.WriteWithCode(w, http.StatusBadRequest, "invalid_token", "Токен недействителен", nil)
// 		return
// 	}

// 	h.responseJSON.WriteJSON(w, http.StatusOK, map[string]string{
// 		"message": "Email успешно подтверждён",
// 	})
// }
