package model

import (
	"time"

	"github.com/jaevor/go-nanoid"
	"gorm.io/gorm"
)

type ChatMessage struct {
	ID        string    `gorm:"primaryKey;size:12" json:"id"`
	FromID    string    `gorm:"size:36;not null" json:"fromId"`
	ToID      string    `gorm:"size:36;not null" json:"toId"`
	Message   string    `gorm:"type:text;not null" json:"message"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

// BeforeCreate генерирует NanoID для ID
func (m *ChatMessage) BeforeCreate(tx *gorm.DB) error {
	genID, err := nanoid.Standard(12)
	if err != nil {
		return err
	}
	m.ID = genID()
	return nil
}
