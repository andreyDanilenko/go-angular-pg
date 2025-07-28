package handler

import (
	"admin/panel/internal/contract"
	"admin/panel/internal/middleware"
	"admin/panel/internal/model"
	"admin/panel/internal/service"
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
)

type ArticleHandler struct {
	service      *service.ArticleService
	errorWriter  contract.ErrorWriter
	responseJSON contract.ResponseWriter
}

func NewArticleHandler(
	service *service.ArticleService,
	ew contract.ErrorWriter,
	rw contract.ResponseWriter,
) *ArticleHandler {
	return &ArticleHandler{
		service:      service,
		errorWriter:  ew,
		responseJSON: rw,
	}
}
func (h *ArticleHandler) CreateArticle(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		h.errorWriter.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var input model.ArticleInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		h.errorWriter.WriteWithCode(
			w,
			http.StatusBadRequest,
			"INVALID_REQUEST",
			"Invalid request payload",
			nil,
		)
		return
	}

	if !input.Category.IsValid() {
		h.errorWriter.WriteWithCode(
			w,
			http.StatusBadRequest,
			"INVALID_CATEGORY",
			"Invalid article category",
			map[string]string{"valid_categories": "general"},
		)
		return
	}

	article, err := h.service.CreateArticle(r.Context(), userID, input)
	if err != nil {
		log.Printf("Failed to create article: %v", err) // Логируем полную ошибку
		h.errorWriter.WriteError(w, http.StatusInternalServerError, "Failed to create article")
		return
	}

	h.responseJSON.WriteJSON(w, http.StatusCreated, article)
}

func (h *ArticleHandler) GetArticle(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	article, err := h.service.GetArticle(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	h.responseJSON.WriteJSON(w, http.StatusCreated, article)
}

func (h *ArticleHandler) GetUserArticles(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		h.errorWriter.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	articles, err := h.service.GetArticlesByAuthor(r.Context(), userID)
	if err != nil {
		h.errorWriter.WriteError(w, http.StatusInternalServerError, "articles not found")
		return
	}

	h.responseJSON.WriteJSON(w, http.StatusCreated, articles)
}

func (h *ArticleHandler) GetAllArticles(w http.ResponseWriter, r *http.Request) {
	articles, err := h.service.GetAllArticles(r.Context())
	if err != nil {
		h.errorWriter.WriteError(w, http.StatusInternalServerError, "articles not found")
		return
	}

	h.responseJSON.WriteJSON(w, http.StatusOK, articles)
}

func (h *ArticleHandler) UpdateArticle(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		h.errorWriter.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	articleID := chi.URLParam(r, "id")
	var input model.ArticleInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		h.errorWriter.WriteWithCode(
			w,
			http.StatusBadRequest,
			"INVALID_REQUEST",
			"Invalid request payload",
			nil,
		)
		return
	}

	if !input.Category.IsValid() {
		validCategories := make([]string, len(model.GetValidCategories()))
		for i, cat := range model.GetValidCategories() {
			validCategories[i] = string(cat)
		}

		h.errorWriter.WriteWithCode(
			w,
			http.StatusBadRequest,
			"INVALID_CATEGORY",
			"Invalid article category",
			map[string]string{"valid_categories": strings.Join(validCategories, ", ")},
		)
		return
	}

	article, err := h.service.UpdateArticle(r.Context(), articleID, userID, input)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if strings.Contains(err.Error(), "forbidden:") {
			statusCode = http.StatusForbidden
		}
		h.errorWriter.WriteError(w, statusCode, err.Error())
		return
	}

	h.responseJSON.WriteJSON(w, http.StatusOK, article)
}

func (h *ArticleHandler) DeleteArticle(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		h.errorWriter.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	id := chi.URLParam(r, "id")

	if err := h.service.DeleteArticle(r.Context(), id, userID); err != nil {
		statusCode := http.StatusInternalServerError
		if strings.Contains(err.Error(), "forbidden:") {
			statusCode = http.StatusForbidden
		}
		h.errorWriter.WriteError(w, statusCode, err.Error())
		return
	}

	h.responseJSON.WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
