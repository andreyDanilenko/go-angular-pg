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
	closed bool
	mu     sync.Mutex
}

type Hub struct {
	Clients     map[string]*Client
	Broadcast   chan model.ChatEvent
	Register    chan *Client
	Unregister  chan *Client
	chatService *service.ChatService
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
			log.Printf("client := <-h.Register: %s", client.UserID)
			h.handleRegister(client)
		case client := <-h.Unregister:
			log.Printf("client := <-h.Unregister: %s", client.UserID)
			h.handleUnregister(client)
		case event := <-h.Broadcast:
			log.Printf("event := <-h.Broadcast: %s", event.Type)
			h.handleBroadcast(event)
		case <-ticker.C:
			log.Printf("<-ticker.C:")
			h.logStats()
		}
	}
}

func (h *Hub) handleRegister(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if oldClient, exists := h.Clients[client.UserID]; exists {
		oldClient.Close()
	}
	h.Clients[client.UserID] = client
	log.Printf("User connected: %s", client.UserID)
}

func (h *Hub) handleUnregister(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if _, exists := h.Clients[client.UserID]; exists {
		client.Close()
		delete(h.Clients, client.UserID)
		log.Printf("User disconnected: %s", client.UserID)
	}
}

func (h *Hub) handleBroadcast(event model.ChatEvent) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal event: %v", err)
		return
	}

	switch event.Type {
	case "message":
		h.broadcastMessage(event, data)
	default:
		log.Printf("Unknown event type: %s", event.Type)
	}
}

func (h *Hub) broadcastMessage(event model.ChatEvent, data []byte) {
	msg, ok := event.Payload.(model.ChatMessage)
	if !ok {
		log.Println("Invalid message format in broadcast")
		return
	}

	participants, err := h.getChatParticipants(msg.ChatID)
	log.Printf("Message sent to broadcastMessage and etChatParticipants%s", msg.SenderID) // Воеменно

	if err != nil {
		log.Printf("Failed to get chat participants: %v", err)
		return
	}

	for _, participantID := range participants {
		if participantID == msg.SenderID {
			continue
		}

		if recipient, exists := h.Clients[participantID]; exists {
			log.Printf("Message sent to if recipient, exists := h.Clients[participantID]%s", msg.SenderID) // Воеменно
			h.sendToClient(recipient, data)
		}
	}
}

func (h *Hub) sendToClient(client *Client, data []byte) {
	log.Printf("Message sent to sendToClient%s", client.UserID) // Воеменно

	select {
	case client.Send <- data:
		log.Printf("Message sent to %s", client.UserID)
	default:
		h.Unregister <- client
	}
}

func (h *Hub) logStats() {
	h.mu.RLock()
	defer h.mu.RUnlock()
	log.Printf("Active connections: %d", len(h.Clients))
}

func (c *Client) Close() {
	c.mu.Lock()
	defer c.mu.Unlock()

	if !c.closed {
		close(c.Send)
		c.Conn.Close()
		c.closed = true
	}
}

func (h *Hub) getChatParticipants(chatID string) ([]string, error) {
	return h.chatService.GetChatParticipants(context.Background(), chatID)
}
