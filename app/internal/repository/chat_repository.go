package repository

import (
	"admin/panel/internal/model"
	"context"

	"gorm.io/gorm"
)

type ChatRepository struct {
	db *gorm.DB
}

func NewChatRepository(db *gorm.DB) *ChatRepository {
	return &ChatRepository{db: db}
}

func (r *ChatRepository) SaveMessage(ctx context.Context, msg *model.ChatMessage) error {
	return r.db.WithContext(ctx).Create(msg).Error
}

func (r *ChatRepository) GetMessagesBetween(ctx context.Context, fromID, toID string) ([]model.ChatMessage, error) {
	var messages []model.ChatMessage
	err := r.db.WithContext(ctx).
		Where("(from_id = ? AND to_id = ?) OR (from_id = ? AND to_id = ?)", fromID, toID, toID, fromID).
		Order("created_at").
		Find(&messages).Error
	return messages, err
}
