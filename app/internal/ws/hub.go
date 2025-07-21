package ws

import (
	"admin/panel/internal/model"
	"admin/panel/internal/service"
	"context"
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Client struct {
	UserID string
	Conn   *websocket.Conn
	Send   chan []byte
}

type Hub struct {
	Clients     map[string]*Client // userID -> client
	Broadcast   chan model.ChatEvent
	Register    chan *Client
	Unregister  chan *Client
	chatService *service.ChatService // Добавляем зависимость
	mu          sync.RWMutex
}

func NewHub(chatService *service.ChatService) *Hub {
	return &Hub{
		Clients:     make(map[string]*Client),
		Broadcast:   make(chan model.ChatEvent),
		Register:    make(chan *Client),
		Unregister:  make(chan *Client),
		chatService: chatService,
	}
}

func (h *Hub) Run() {
	log.Println("WebSocket hub started")
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			if oldClient, exists := h.Clients[client.UserID]; exists {
				close(oldClient.Send)
				oldClient.Conn.Close()
			}
			h.Clients[client.UserID] = client
			h.mu.Unlock()
			log.Printf("User connected: %s", client.UserID)

		case client := <-h.Unregister:
			h.mu.Lock()
			if _, exists := h.Clients[client.UserID]; exists {
				close(client.Send)
				delete(h.Clients, client.UserID)
				log.Printf("User disconnected: %s", client.UserID)
			}
			h.mu.Unlock()

		case event := <-h.Broadcast:
			h.mu.RLock()
			data, err := json.Marshal(event)
			if err != nil {
				log.Printf("Failed to marshal event: %v", err)
				h.mu.RUnlock()
				continue
			}

			switch event.Type {
			case "message":
				msg, ok := event.Payload.(model.ChatMessage)
				if !ok {
					log.Println("Invalid message format in broadcast")
					h.mu.RUnlock()
					continue
				}

				// Получаем участников чата
				participants, err := h.getChatParticipants(msg.ChatID) // Нужно реализовать эту функцию
				if err != nil {
					log.Printf("Failed to get chat participants: %v", err)
					h.mu.RUnlock()
					continue
				}

				// Отправляем сообщение всем участникам чата, кроме отправителя
				for _, participantID := range participants {
					if participantID == msg.SenderID {
						continue
					}

					if recipient, exists := h.Clients[participantID]; exists {
						select {
						case recipient.Send <- data:
							log.Printf("Message sent to %s", participantID)
						default:
							close(recipient.Send)
							delete(h.Clients, participantID)
						}
					}
				}

			default:
				log.Printf("Unknown event type: %s", event.Type)
			}
			h.mu.RUnlock()

		case <-ticker.C:
			h.mu.RLock()
			log.Printf("Active connections: %d", len(h.Clients))
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) getChatParticipants(chatID string) ([]string, error) {
	participants, err := h.chatService.GetChatParticipants(context.Background(), chatID)
	if err != nil {
		return nil, err
	}
	return participants, nil
}

func (h *Hub) BroadcastToChat(chatID string, senderID string, message []byte) error {
	// 1. Получаем всех участников чата
	participants, err := h.chatService.GetChatParticipants(context.Background(), chatID)
	if err != nil {
		return err
	}

	// 2. Отправляем всем, включая отправителя (для синхронизации chatId)
	for _, userID := range participants {
		if client, ok := h.Clients[userID]; ok {
			client.Send <- message
		}
	}
	return nil
}
