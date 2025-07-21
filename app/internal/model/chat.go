package model

import (
	"time"

	"github.com/jaevor/go-nanoid"
	"gorm.io/gorm"
)

type ChatMessageRead struct {
	MessageID string    `gorm:"primaryKey;size:36"`
	UserID    string    `gorm:"primaryKey;size:36"`
	ReadAt    time.Time `gorm:"autoCreateTime"`
}

type ChatRoom struct {
	ID           string    `gorm:"primaryKey;size:36" json:"id"`
	Name         string    `gorm:"size:100" json:"name"`
	IsGroup      bool      `gorm:"default:false" json:"isGroup"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
	Participants []User    `gorm:"many2many:chat_participants;" json:"participants"`
	UnreadCount  int       `json:"unreadCount" gorm:"-"`
}

type ChatParticipant struct {
	UserID   string    `gorm:"primaryKey;size:36" json:"userId"`
	ChatID   string    `gorm:"primaryKey;size:36" json:"chatId"`
	JoinedAt time.Time `gorm:"autoCreateTime" json:"joinedAt"`
}

type ChatMessage struct {
	ID       string    `gorm:"primaryKey;size:36" json:"id"`
	ChatID   string    `gorm:"size:36;not null;index" json:"chatId"`
	SenderID string    `gorm:"size:36;not null;index" json:"senderId"`
	Text     string    `gorm:"type:text;not null" json:"text"`
	SentAt   time.Time `gorm:"autoCreateTime;index" json:"sentAt"`
	Sender   User      `gorm:"foreignKey:SenderID" json:"sender"`
}

type ChatEvent struct {
	Type    string      `json:"type"` // "message", "join", "leave"
	Payload interface{} `json:"payload"`
}

type WsChatMessage struct {
	ChatID string `json:"chatId"`
	Text   string `json:"text"`
}

// Добавляем новую структуру для входящих сообщений
type WsDirectMessage struct {
	RecipientID string `json:"recipientId"`
	Text        string `json:"text"`
}

func (c *ChatRoom) BeforeCreate(tx *gorm.DB) error {
	genID, err := nanoid.Standard(12)
	if err != nil {
		return err
	}
	c.ID = genID()
	return nil
}

func (u *ChatMessage) BeforeCreate(tx *gorm.DB) error {
	genID, err := nanoid.Standard(12)
	if err != nil {
		return err
	}
	u.ID = genID()
	return nil
}
