package handler

import (
	"admin/panel/internal/middleware"
	"admin/panel/internal/service"
	"admin/panel/internal/ws"
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type ChatHandler struct {
	Hub     *ws.Hub
	Service *service.ChatService
}

func NewChatHandler(service *service.ChatService, hub *ws.Hub) *ChatHandler {
	return &ChatHandler{
		Hub:     hub,
		Service: service,
	}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // В продакшене реализовать проверку
	},
}

func (h *ChatHandler) ServeWS(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "upgrade error", http.StatusInternalServerError)
		return
	}

	// Создаем клиента с сервисом
	client := ws.NewClient(conn, userID, h.Hub, h.Service)

	// Регистрируем клиента, отправляя его в канал Hub.Register
	h.Hub.Register <- client

	// Запускаем горутины для чтения и записи сообщений
	go client.Read(r.Context())
	go client.Write()
}

func (h *ChatHandler) GetMessages(w http.ResponseWriter, r *http.Request) {
	fromID := r.URL.Query().Get("from")
	toID := r.URL.Query().Get("to")

	if fromID == "" || toID == "" {
		http.Error(w, "missing parameters", http.StatusBadRequest)
		return
	}

	messages, err := h.Service.GetMessagesBetween(r.Context(), fromID, toID)
	if err != nil {
		log.Printf("GetMessagesBetween error: %v", err)
		http.Error(w, "failed to get messages", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}
