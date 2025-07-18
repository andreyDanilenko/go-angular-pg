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
	authService *service.UserService
	validate    *validator.Validate
	errorWriter contract.ErrorWriter
}

func NewUserHandler(authService *service.UserService, ew contract.ErrorWriter) *UserHandler {
	return &UserHandler{
		authService: authService,
		validate:    validator.New(),
		errorWriter: ew,
	}
}

func (h *UserHandler) SignUp(w http.ResponseWriter, r *http.Request) {
	var input model.SignUpInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		h.errorWriter.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.validate.Struct(input); err != nil {
		h.errorWriter.WriteWithCode(w, http.StatusBadRequest, "validation_failed", "Ошибка валидации", err)
		return
	}

	user, token, err := h.authService.Register(r.Context(), input)
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

	response := map[string]interface{}{
		"user":  user,
		"token": token,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *UserHandler) SignIn(w http.ResponseWriter, r *http.Request) {
	var input model.SignInInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.validate.Struct(input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	user, token, err := h.authService.Login(r.Context(), input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	response := map[string]interface{}{
		"user":  user,
		"token": token,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *UserHandler) GetUsers(w http.ResponseWriter, r *http.Request) {
	users, err := h.authService.GetUsers(r.Context())
	if err != nil {
		http.Error(w, "failed to get users", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

func (h *UserHandler) GetUserByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	user, err := h.authService.GetUserByID(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func (h *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "id")

	authUserID, _ := r.Context().Value(middleware.UserIDKey).(string)
	role, _ := r.Context().Value(middleware.RoleKey).(model.UserRole)

	if authUserID != userID && role != model.RoleAdmin {
		h.errorWriter.WriteError(w, http.StatusUnauthorized, "Другого пользователя может редактировать только Админ")
		// http.Error(w, "Другого пользователя может редактировать только Админ", http.StatusForbidden)
		return
	}

	var input model.UpdateUserInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "неверный формат", http.StatusBadRequest)
		return
	}

	user, err := h.authService.UpdateUser(r.Context(), userID, input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}
