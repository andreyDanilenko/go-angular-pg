package handler

import (
	"admin/panel/internal/contract"
	"admin/panel/internal/middleware"
	"admin/panel/internal/model"
	"admin/panel/internal/service"
	"admin/panel/internal/ws"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type createChatRequest struct {
	OtherUserID string `json:"otherUserId"`
}

type ChatHandler struct {
	chatService  *service.ChatService
	hub          *ws.Hub
	errorWriter  contract.ErrorWriter
	responseJSON contract.ResponseWriter
}

func NewChatHandler(chatService *service.ChatService, hub *ws.Hub, ew contract.ErrorWriter, rw contract.ResponseWriter) *ChatHandler {
	return &ChatHandler{
		chatService:  chatService,
		hub:          hub,
		errorWriter:  ew,
		responseJSON: rw,
	}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // В продакшене нужно ограничить допустимые origin
	},
}

func (h *ChatHandler) ServeWS(w http.ResponseWriter, r *http.Request) {
	// 1. Извлекаем обязательные параметры
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		log.Println("WebSocket: missing userID in context")
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	chatID := r.URL.Query().Get("chatId")
	if chatID == "" {
		log.Println("WebSocket: chatId parameter is required")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// 2. Устанавливаем соединение
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}

	// 3. Создаем и регистрируем клиента
	client := &ws.Client{
		UserID: userID,
		Conn:   conn,
		Send:   make(chan []byte, 256),
	}

	// 4. Добавляем клиента в хаб и комнату
	h.hub.Register <- client
	h.hub.JoinRoom(client, chatID)

	log.Printf("New WebSocket connection: user=%s, chat=%s", userID, chatID)

	// 5. Запускаем обработчики
	go func() {
		defer func() {
			h.hub.Unregister <- client
			h.hub.LeaveRoom(client, chatID)
			conn.Close()
			log.Printf("WebSocket closed: user=%s, chat=%s", userID, chatID)
		}()

		h.readMessages(client)
	}()

	go h.writeMessages(client)
}
func (h *ChatHandler) readMessages(client *ws.Client) {
	defer func() {
		h.hub.Unregister <- client
		client.Conn.Close()
	}()

	for {
		_, message, err := client.Conn.ReadMessage()
		if err != nil {
			break
		}

		var msg model.WsChatMessage
		if err := json.Unmarshal(message, &msg); err != nil {
			continue
		}

		// Сохраняем сообщение в БД
		chatMessage, err := h.chatService.SaveMessage(context.Background(), msg.ChatID, client.UserID, msg.Text)
		if err != nil {
			continue
		}

		// Отправляем сообщение всем участникам чата
		h.hub.Broadcast <- model.ChatEvent{
			Type:    "message",
			Payload: *chatMessage,
		}
	}
}

func (h *ChatHandler) writeMessages(client *ws.Client) {
	defer client.Conn.Close()

	for {
		select {
		case message, ok := <-client.Send:
			if !ok {
				client.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := client.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}
		}
	}
}

func (h *ChatHandler) GetMessages(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)
	chatID := r.URL.Query().Get("chatId")
	if chatID == "" {
		http.Error(w, "chatId is required", http.StatusBadRequest)
		return
	}

	// Проверяем, что пользователь является участником чата
	chats, err := h.chatService.GetUserChats(r.Context(), userID)
	if err != nil {
		http.Error(w, "Failed to get user chats", http.StatusInternalServerError)
		return
	}

	var hasAccess bool
	fmt.Println(chats)
	for _, chat := range chats {
		if chat.ID == chatID {
			hasAccess = true
			break
		}
	}

	if !hasAccess {
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}

	messages, err := h.chatService.GetMessages(r.Context(), chatID, 50, 0)
	if err != nil {
		http.Error(w, "Failed to get messages", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

func (h *ChatHandler) CreatePrivateChat(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		h.errorWriter.WriteError(w, http.StatusUnauthorized, "User ID missing in context")
		return
	}

	var req createChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.errorWriter.WriteError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	if req.OtherUserID == "" {
		h.errorWriter.WriteError(w, http.StatusBadRequest, "otherUserId is required")
		return
	}

	chat, err := h.chatService.CreatePrivateChat(userID, req.OtherUserID)
	if err != nil {
		h.errorWriter.WriteError(w, http.StatusInternalServerError, "Failed to create chat: "+err.Error())
		return
	}

	h.responseJSON.WriteJSON(w, http.StatusCreated, chat)
}
