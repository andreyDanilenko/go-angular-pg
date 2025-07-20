package repository

import (
	"admin/panel/internal/model"
	"context"
	"time"

	"gorm.io/gorm"
)

type ChatRepository struct {
	db *gorm.DB
}

func NewChatRepository(db *gorm.DB) *ChatRepository {
	return &ChatRepository{db: db}
}

func (r *ChatRepository) SaveMessage(ctx context.Context, message *model.ChatMessage) error {
	return r.db.WithContext(ctx).Create(message).Error
}

func (r *ChatRepository) GetMessages(ctx context.Context, chatID string, limit, offset int) ([]model.ChatMessage, error) {
	var messages []model.ChatMessage
	err := r.db.WithContext(ctx).
		Where("chat_id = ?", chatID).
		Preload("Sender").
		Order("sent_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&messages).Error

	return messages, err
}

func (r *ChatRepository) GetUserChats(ctx context.Context, userID string) ([]model.ChatRoom, error) {
	var chats []model.ChatRoom
	err := r.db.WithContext(ctx).
		Joins("JOIN chat_participants ON chat_participants.chat_id = chat_rooms.id").
		Where("chat_participants.user_id = ?", userID).
		Find(&chats).Error

	return chats, err
}

func (r *ChatRepository) CreatePrivateChat(user1ID, user2ID string) (*model.ChatRoom, error) {
	chat := &model.ChatRoom{
		// ID будет сгенерирован в BeforeCreate (нужно будет добавить)
		Name:    "",
		IsGroup: false,
	}

	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(chat).Error; err != nil {
			return err
		}

		participants := []model.ChatParticipant{
			{UserID: user1ID, ChatID: chat.ID, JoinedAt: time.Now()},
			{UserID: user2ID, ChatID: chat.ID, JoinedAt: time.Now()},
		}

		if err := tx.Create(&participants).Error; err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	return chat, nil
}

func (r *ChatRepository) GetMessageWithSender(ctx context.Context, messageID string) (*model.ChatMessage, error) {
	var message model.ChatMessage
	err := r.db.WithContext(ctx).
		Preload("Sender").
		First(&message, "id = ?", messageID).
		Error
	return &message, err
}
