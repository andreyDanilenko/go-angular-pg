package ws

import (
	"admin/panel/internal/model"
	"log"
)

type Hub struct {
	Clients    map[string]*Client
	Register   chan *Client
	Unregister chan *Client
	Broadcast  chan model.ChatMessage
}

func NewHub() *Hub {
	return &Hub{
		Clients:    make(map[string]*Client),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan model.ChatMessage),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.Clients[client.UserID] = client
			log.Println("User connected:", client.UserID)

		case client := <-h.Unregister:
			if _, ok := h.Clients[client.UserID]; ok {
				delete(h.Clients, client.UserID)
				close(client.Send)
				log.Println("User disconnected:", client.UserID)
			}

		case msg := <-h.Broadcast:
			if receiver, ok := h.Clients[msg.ToID]; ok {
				// Отправляем сообщение получателю, если он подключен
				select {
				case receiver.Send <- msg:
				default:
					// Если канал переполнен — закрываем соединение с получателем
					close(receiver.Send)
					delete(h.Clients, receiver.UserID)
				}
			}
		}
	}
}
