// handler/chat.go
package handler

import (
	"admin/panel/internal/contract"
	"admin/panel/internal/middleware"
	"admin/panel/internal/model"
	"admin/panel/internal/service"
	"admin/panel/internal/ws"
	"context"
	"encoding/json"
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
		return true
	},
}

func (h *ChatHandler) ServeWS(w http.ResponseWriter, r *http.Request) {
	// ======================
	// 1. Аутентификация пользователя
	// ======================
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		h.errorWriter.WriteError(w, http.StatusUnauthorized, "missing user ID")
		return
	}

	// ======================
	// 2. Установка WebSocket соединения
	// ======================
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}

	// ======================
	// 3. Создание клиентской структуры
	// ======================
	client := &ws.Client{
		UserID: userID,
		Conn:   conn,
		Send:   make(chan []byte, 256), // буферизированный канал
	}

	// ======================
	// 4. Регистрация клиента в хабе
	// ======================
	h.hub.Register <- client
	log.Printf("New WebSocket connection: user=%s", userID)

	// ======================
	// 5. Запуск горутин для чтения/записи
	// ======================
	go h.readPump(client)  // обработка входящих сообщений
	go h.writePump(client) // отправка исходящих сообщений
}

func (h *ChatHandler) readPump(client *ws.Client) {
	// ======================
	// 1. Очистка при завершении
	// ======================
	defer func() {
		h.hub.Unregister <- client
		client.Conn.Close()
	}()

	for {
		// ======================
		// 2. Чтение входящего сообщения
		// ======================
		_, msgBytes, err := client.Conn.ReadMessage()
		if err != nil {
			break
		}

		// ======================
		// 3. Парсинг входных данных
		// ======================
		var input struct {
			ChatID      string `json:"chatId"`
			RecipientID string `json:"recipientId"`
			Text        string `json:"text"`
		}

		if err := json.Unmarshal(msgBytes, &input); err != nil {
			log.Printf("Failed to unmarshal message: %v", err)
			continue
		}

		// ======================
		// 4. Разрешение идентификатора чата
		// ======================
		chatID, err := h.chatService.ResolveChatID(client.UserID, input.RecipientID, input.ChatID)
		if err != nil {
			log.Printf("Chat resolution failed: %v", err)
			continue
		}

		// ======================
		// 5. Сохранение сообщения в БД
		// ======================
		msg, err := h.chatService.SaveMessage(context.Background(), chatID, client.UserID, input.Text)
		if err != nil {
			log.Printf("Failed to save message: %v", err)
			continue
		}

		// ======================
		// 6. Получение полных данных сообщения
		// ======================
		fullMsg, err := h.chatService.GetMessageWithSender(context.Background(), msg.ID)
		if err != nil {
			log.Printf("Failed to get message details: %v", err)
			continue
		}

		// ======================
		// 7. Получение участников чата
		// ======================
		participants, err := h.chatService.GetChatParticipants(context.Background(), chatID)
		if err != nil {
			log.Printf("Failed to get chat participants: %v", err)
			continue
		}

		// ======================
		// 8. Формирование события
		// ======================
		event := model.ChatEvent{
			Type:    "message",
			Payload: *fullMsg,
		}
		eventBytes, _ := json.Marshal(event)

		// ======================
		// 9. Рассылка сообщения участникам
		// ======================
		for _, participantID := range participants {
			if recipient, exists := h.hub.Clients[participantID]; exists {
				select {
				case recipient.Send <- eventBytes:
					// Сообщение отправлено
				default:
					close(recipient.Send)
					delete(h.hub.Clients, participantID)
				}
			}
		}
	}
}

func (h *ChatHandler) writePump(client *ws.Client) {
	// ======================
	// 1. Очистка при завершении
	// ======================
	defer client.Conn.Close()

	for {
		select {
		case message, ok := <-client.Send:
			// ======================
			// 2. Проверка состояния канала
			// ======================
			if !ok {
				client.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			// ======================
			// 3. Отправка сообщения через WebSocket
			// ======================
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

	// Проверяем, что пользователь участвует в чате
	chats, err := h.chatService.GetUserChats(r.Context(), userID)
	if err != nil {
		http.Error(w, "Failed to get user chats", http.StatusInternalServerError)
		return
	}
	var hasAccess bool
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

	// Получаем сообщения
	messages, err := h.chatService.GetMessagesWithReadStatus(r.Context(), chatID, userID, 50, 0)
	if err != nil {
		http.Error(w, "Failed to get messages", http.StatusInternalServerError)
		return
	}

	// Помечаем как прочитанные
	for _, msg := range messages {
		if msg.SenderID != userID {
			_ = h.chatService.MarkMessageRead(r.Context(), msg.ID, userID)
		}
	}

	h.responseJSON.WriteJSON(w, http.StatusOK, messages)
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

func (h *ChatHandler) GetUserChats(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)

	chats, err := h.chatService.GetUserChats(r.Context(), userID)
	if err != nil {
		h.errorWriter.WriteError(w, http.StatusInternalServerError, "Failed to get chats")
		return
	}

	h.responseJSON.WriteJSON(w, http.StatusOK, chats)
}
