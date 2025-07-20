package ws

import (
	"admin/panel/internal/model"
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
	Clients    map[*Client]bool
	Rooms      map[string]map[*Client]bool // roomID -> clients
	Broadcast  chan model.ChatEvent
	Register   chan *Client
	Unregister chan *Client
	mu         sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		Clients:    make(map[*Client]bool),
		Rooms:      make(map[string]map[*Client]bool),
		Broadcast:  make(chan model.ChatEvent),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	log.Println("WebSocket hub started")
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case client := <-h.Register:
			log.Printf("New client connected: UserID=%s", client.UserID)
			h.mu.Lock()
			h.Clients[client] = true
			h.mu.Unlock()

		case client := <-h.Unregister:
			log.Printf("Client disconnected: UserID=%s", client.UserID)
			h.mu.Lock()
			if _, ok := h.Clients[client]; ok {
				delete(h.Clients, client)
				close(client.Send)
			}
			// Удаляем клиента из всех комнат
			for roomID, clients := range h.Rooms {
				if _, ok := clients[client]; ok {
					delete(clients, client)
					if len(clients) == 0 {
						delete(h.Rooms, roomID)
						log.Printf("Room emptied and removed: RoomID=%s", roomID)
					}
				}
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
					log.Println("Received invalid message format in broadcast")
					h.mu.RUnlock()
					continue
				}

				log.Printf("Broadcasting message: ChatID=%s, SenderID=%s, MessageLength=%d",
					msg.ChatID, msg.SenderID, len(msg.Text))

				if clients, ok := h.Rooms[msg.ChatID]; ok {
					for client := range clients {
						select {
						case client.Send <- data:
							log.Printf("Message sent to client: UserID=%s", client.UserID)
						default:
							log.Printf("Client buffer full, disconnecting: UserID=%s", client.UserID)
							close(client.Send)
							delete(clients, client)
						}
					}
				} else {
					log.Printf("No clients in room: ChatID=%s", msg.ChatID)
				}

			default:
				log.Printf("Broadcasting system event: Type=%s", event.Type)
				for client := range h.Clients {
					select {
					case client.Send <- data:
						// Message sent successfully
					default:
						log.Printf("Client buffer full, disconnecting: UserID=%s", client.UserID)
						close(client.Send)
						delete(h.Clients, client)
					}
				}
			}
			h.mu.RUnlock()

		case <-ticker.C:
			h.mu.RLock()
			log.Printf("Hub status: TotalClients=%d, ActiveRooms=%d",
				len(h.Clients), len(h.Rooms))
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) JoinRoom(client *Client, roomID string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	// Создаем комнату если ее нет
	if _, ok := h.Rooms[roomID]; !ok {
		h.Rooms[roomID] = make(map[*Client]bool)
		log.Printf("New room created: %s", roomID)
	}

	// Добавляем клиента
	h.Rooms[roomID][client] = true
	h.Clients[client] = true

	log.Printf("User %s added to room %s (total: %d)",
		client.UserID, roomID, len(h.Rooms[roomID]))
}

func (h *Hub) LeaveRoom(client *Client, roomID string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	log.Printf("Client leaving room: UserID=%s, RoomID=%s", client.UserID, roomID)

	if clients, ok := h.Rooms[roomID]; ok {
		delete(clients, client)
		if len(clients) == 0 {
			delete(h.Rooms, roomID)
			log.Printf("Room emptied and removed: RoomID=%s", roomID)
		}
	}
}
