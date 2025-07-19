package handler

import (
	"admin/panel/internal/middleware"
	"admin/panel/internal/service"
	"admin/panel/internal/ws"
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

	client := ws.NewClient(conn, userID, h.Hub)
	h.Hub.RegisterClient(client)

	go client.Read(r.Context())
	go client.Write()
}
