package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"admin/panel/internal/contract"
	"admin/panel/internal/middleware"
	"admin/panel/internal/model"
	"admin/panel/internal/repository"
	"admin/panel/internal/service"

	"github.com/go-chi/chi/v5"
	"github.com/go-playground/validator/v10"
)

type ArticleHandler struct {
	service        *service.ArticleService
	validator      *validator.Validate
	errorWriter    contract.ErrorWriter
	responseWriter contract.ResponseWriter
}

func NewArticleHandler(
	service *service.ArticleService,
	errorWriter contract.ErrorWriter,
	responseWriter contract.ResponseWriter,
) *ArticleHandler {
	return &ArticleHandler{
		service:        service,
		validator:      validator.New(),
		errorWriter:    errorWriter,
		responseWriter: responseWriter,
	}
}

func (h *ArticleHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := currentIdentity(r)
	if !ok {
		h.errorWriter.WriteError(w, http.StatusUnauthorized, "Требуется авторизация")
		return
	}
	input, ok := h.decodeInput(w, r)
	if !ok {
		return
	}
	article, err := h.service.Create(r.Context(), userID, input)
	if err != nil {
		h.writeError(w, err)
		return
	}
	h.responseWriter.WriteJSON(w, http.StatusCreated, article)
}

func (h *ArticleHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	article, err := h.service.GetByID(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		h.writeError(w, err)
		return
	}
	h.responseWriter.WriteJSON(w, http.StatusOK, article)
}

func (h *ArticleHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	articles, err := h.service.GetAll(r.Context())
	if err != nil {
		h.errorWriter.WriteError(w, http.StatusInternalServerError, "Не удалось загрузить посты")
		return
	}
	h.responseWriter.WriteJSON(w, http.StatusOK, articles)
}

func (h *ArticleHandler) GetCurrentUserArticles(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := currentIdentity(r)
	if !ok {
		h.errorWriter.WriteError(w, http.StatusUnauthorized, "Требуется авторизация")
		return
	}
	articles, err := h.service.GetByAuthor(r.Context(), userID)
	if err != nil {
		h.errorWriter.WriteError(w, http.StatusInternalServerError, "Не удалось загрузить посты пользователя")
		return
	}
	h.responseWriter.WriteJSON(w, http.StatusOK, articles)
}

func (h *ArticleHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID, role, ok := currentIdentity(r)
	if !ok {
		h.errorWriter.WriteError(w, http.StatusUnauthorized, "Требуется авторизация")
		return
	}
	input, ok := h.decodeInput(w, r)
	if !ok {
		return
	}
	article, err := h.service.Update(
		r.Context(),
		chi.URLParam(r, "id"),
		userID,
		role,
		input,
	)
	if err != nil {
		h.writeError(w, err)
		return
	}
	h.responseWriter.WriteJSON(w, http.StatusOK, article)
}

func (h *ArticleHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID, role, ok := currentIdentity(r)
	if !ok {
		h.errorWriter.WriteError(w, http.StatusUnauthorized, "Требуется авторизация")
		return
	}
	if err := h.service.Delete(r.Context(), chi.URLParam(r, "id"), userID, role); err != nil {
		h.writeError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *ArticleHandler) decodeInput(w http.ResponseWriter, r *http.Request) (model.ArticleInput, bool) {
	var input model.ArticleInput
	decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&input); err != nil {
		h.errorWriter.WriteWithCode(w, http.StatusBadRequest, "invalid_body", "Неверный формат запроса", nil)
		return model.ArticleInput{}, false
	}
	if err := h.validator.Struct(input); err != nil || !input.Category.IsValid() {
		h.errorWriter.WriteWithCode(w, http.StatusBadRequest, "validation_failed", "Проверьте поля поста", nil)
		return model.ArticleInput{}, false
	}
	return input, true
}

func (h *ArticleHandler) writeError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, repository.ErrArticleNotFound):
		h.errorWriter.WriteError(w, http.StatusNotFound, "Пост не найден")
	case errors.Is(err, service.ErrArticleForbidden):
		h.errorWriter.WriteError(w, http.StatusForbidden, "Недостаточно прав для изменения поста")
	case errors.Is(err, service.ErrInvalidArticleCategory):
		h.errorWriter.WriteError(w, http.StatusBadRequest, "Некорректная категория")
	default:
		h.errorWriter.WriteError(w, http.StatusInternalServerError, "Не удалось выполнить операцию с постом")
	}
}

func currentIdentity(r *http.Request) (string, model.UserRole, bool) {
	userID, userOK := middleware.UserID(r.Context())
	role, roleOK := middleware.Role(r.Context())
	return userID, role, userOK && roleOK
}
