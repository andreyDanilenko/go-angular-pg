package ws

import (
	"admin/panel/internal/model"
	"admin/panel/internal/service"
	"context"
	"encoding/json"
	"log"

	"github.com/gorilla/websocket"
)

type Client struct {
	Conn    *websocket.Conn
	UserID  string
	Send    chan model.ChatMessage
	Hub     *Hub
	Service *service.ChatService
}

func NewClient(conn *websocket.Conn, userID string, hub *Hub, service *service.ChatService) *Client {
	return &Client{
		Conn:    conn,
		UserID:  userID,
		Send:    make(chan model.ChatMessage, 256),
		Hub:     hub,
		Service: service,
	}
}

func (c *Client) Read(ctx context.Context) {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()

	for {
		_, msgBytes, err := c.Conn.ReadMessage()
		if err != nil {
			log.Println("Read error:", err)
			break
		}

		var msg model.ChatMessage
		if err := json.Unmarshal(msgBytes, &msg); err != nil {
			log.Println("Invalid message format:", err)
			continue
		}

		msg.FromID = c.UserID // Всегда ставим корректного отправителя

		// Сохраняем сообщение в БД через сервис
		if err := c.Service.SaveMessage(ctx, &msg); err != nil {
			log.Println("Failed to save message:", err)
		}

		// Отправляем сообщение через хаб всем нужным клиентам
		c.Hub.Broadcast <- msg
	}
}

func (c *Client) Write() {
	defer func() {
		_ = c.Conn.Close()
	}()

	for msg := range c.Send {
		msgBytes, err := json.Marshal(msg)
		if err != nil {
			log.Println("Marshal error:", err)
			continue
		}

		if err := c.Conn.WriteMessage(websocket.TextMessage, msgBytes); err != nil {
			log.Println("Write error:", err)
			break
		}
	}
}
