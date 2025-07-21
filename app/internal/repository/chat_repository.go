// repository/chat.go
package repository

import (
	"admin/panel/internal/model"
	"context"
	"fmt"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type ChatRepository struct {
	db *gorm.DB
}

func NewChatRepository(db *gorm.DB) *ChatRepository {
	return &ChatRepository{db: db}
}

func (r *ChatRepository) ChatExists(chatID string) (bool, error) {
	var count int64
	err := r.db.Model(&model.ChatRoom{}).
		Where("id = ?", chatID).
		Count(&count).
		Error
	return count > 0, err
}

func (r *ChatRepository) SaveMessage(ctx context.Context, message *model.ChatMessage) error {
	return r.db.WithContext(ctx).Create(message).Error
}

func (r *ChatRepository) IsMessageRead(messageID, userID string) (bool, error) {
	var count int64
	err := r.db.Model(&model.ChatMessageRead{}).
		Where("message_id = ? AND user_id = ?", messageID, userID).
		Count(&count).Error
	return count > 0, err
}

func (r *ChatRepository) MarkMessageRead(messageID, userID string) error {
	return r.db.Clauses(clause.OnConflict{DoNothing: true}).
		Create(&model.ChatMessageRead{
			MessageID: messageID,
			UserID:    userID,
		}).Error
}

func (r *ChatRepository) CountUnreadMessages(chatID, userID string) (int, error) {
	var count int64
	err := r.db.Raw(`
		SELECT COUNT(*) FROM chat_messages m
		WHERE m.chat_id = ? AND m.sender_id != ? AND NOT EXISTS (
			SELECT 1 FROM chat_message_reads r WHERE r.message_id = m.id AND r.user_id = ?
		)
	`, chatID, userID, userID).Scan(&count).Error
	return int(count), err
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
		Preload("Participants").
		Find(&chats).Error

	return chats, err
}

func (r *ChatRepository) CreatePrivateChat(user1ID, user2ID string) (*model.ChatRoom, error) {
	chat := &model.ChatRoom{
		// ID будет сгенерирован в BeforeCreate (нужно будет добавить)
		Name:    "",
		IsGroup: false,
	}

	existingID, _ := r.FindPrivateChat(user1ID, user2ID)
	if existingID != "" {
		return nil, fmt.Errorf("chat already exists")
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

func (r *ChatRepository) GetChatParticipants(ctx context.Context, chatID string) ([]string, error) {
	var participants []string
	err := r.db.WithContext(ctx).
		Model(&model.ChatParticipant{}).
		Where("chat_id = ?", chatID).
		Pluck("user_id", &participants).
		Error
	return participants, err
}

// service/chat.go

// Проверяет, является ли пользователь участником чата
func (r *ChatRepository) IsChatParticipant(chatID string, userID string) (bool, error) {
	var count int64
	err := r.db.Model(&model.ChatParticipant{}).
		Where("chat_id = ? AND user_id = ?", chatID, userID).
		Count(&count).
		Error
	return count > 0, err
}

// Находит приватный чат между двумя пользователями
func (r *ChatRepository) FindPrivateChat(user1ID, user2ID string) (string, error) {
	var chatID string
	err := r.db.
		Table("chat_participants AS cp1").
		Select("cp1.chat_id").
		Joins("JOIN chat_participants cp2 ON cp1.chat_id = cp2.chat_id").
		Where("cp1.user_id = ? AND cp2.user_id = ?", user1ID, user2ID).
		Where("EXISTS (SELECT 1 FROM chat_rooms WHERE id = cp1.chat_id AND is_group = false)").
		Limit(1).
		Row().
		Scan(&chatID)

	if err != nil {
		return "", fmt.Errorf("chat not found")
	}
	return chatID, nil
}
