package ws

import (
	"admin/panel/internal/model"
	"context"
	"encoding/json"
	"log"

	"github.com/gorilla/websocket"
)

type Client struct {
	UserID string
	Conn   ConnInterface
	Send   chan model.ChatMessage
	Hub    *Hub
}

func NewClient(conn ConnInterface, userID string, hub *Hub) *Client {
	return &Client{
		UserID: userID,
		Conn:   conn,
		Send:   make(chan model.ChatMessage, 256),
		Hub:    hub,
	}
}

func (c *Client) Read(ctx context.Context) {
	defer func() {
		c.Hub.unregister <- c
		_ = c.Conn.Close()
	}()

	for {
		_, messageBytes, err := c.Conn.ReadMessage()
		if err != nil {
			log.Println("read error:", err)
			break
		}

		var msg model.ChatMessage
		if err := json.Unmarshal(messageBytes, &msg); err != nil {
			log.Println("invalid message format:", err)
			continue
		}

		msg.FromID = c.UserID
		c.Hub.broadcast <- msg
	}
}

func (c *Client) Write() {
	defer func() {
		_ = c.Conn.Close()
	}()

	for msg := range c.Send {
		msgBytes, err := json.Marshal(msg)
		if err != nil {
			log.Println("marshal error:", err)
			continue
		}

		err = c.Conn.WriteMessage(websocket.TextMessage, msgBytes)
		if err != nil {
			log.Println("write error:", err)
			break
		}
	}
}

type ConnInterface interface {
	ReadMessage() (messageType int, p []byte, err error)
	WriteMessage(messageType int, data []byte) error
	Close() error
}
