package handler

import (
	"admin/panel/internal/model"
	"encoding/json"
	"net/http"

	"gorm.io/gorm"
)

// Структура для объединения всех данных
type FullDump struct {
	Users             []model.User              `json:"users"`
	Chats             []model.ChatRoom          `json:"chats"`
	Messages          []model.ChatMessage       `json:"messages"`
	Participants      []model.ChatParticipant   `json:"participants"`
	Reads             []model.ChatMessageRead   `json:"reads"`
	EmailConfirmation []model.EmailConfirmation `json:"emailConfirmation"`
}

type DumpHandler struct {
	DB *gorm.DB
}

func NewDumpHandler(db *gorm.DB) *DumpHandler {
	return &DumpHandler{DB: db}
}

func (h *DumpHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var dump FullDump

	if err := h.DB.Find(&dump.Users).Error; err != nil {
		http.Error(w, "Failed to fetch users: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if err := h.DB.Find(&dump.Chats).Error; err != nil {
		http.Error(w, "Failed to fetch chats: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if err := h.DB.Find(&dump.Messages).Error; err != nil {
		http.Error(w, "Failed to fetch messages: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if err := h.DB.Find(&dump.Participants).Error; err != nil {
		http.Error(w, "Failed to fetch participants: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if err := h.DB.Find(&dump.Reads).Error; err != nil {
		http.Error(w, "Failed to fetch reads: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if err := h.DB.Find(&dump.EmailConfirmation).Error; err != nil {
		http.Error(w, "Failed to fetch reads: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	// json.NewEncoder(w).Encode(dump)

	if err := json.NewEncoder(w).Encode(dump); err != nil {
		http.Error(w, "Failed to encode JSON: "+err.Error(), http.StatusInternalServerError)
		return
	}
}
