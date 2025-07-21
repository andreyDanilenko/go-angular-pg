// service/chat.go
package service

import (
	"admin/panel/internal/model"
	"admin/panel/internal/repository"
	"context"
	"errors"
	"fmt"
)

type ChatService struct {
	repo *repository.ChatRepository
}

func NewChatService(repo *repository.ChatRepository) *ChatService {
	return &ChatService{repo: repo}
}

func (s *ChatService) ResolveChatID(senderID, recipientID, existingChatID string) (string, error) {
	// Если указан chatID, проверяем доступ
	if existingChatID != "" {
		if isMember, _ := s.repo.IsChatParticipant(existingChatID, senderID); isMember {
			return existingChatID, nil
		}
		return "", errors.New("access denied")
	}

	// Ищем существующий чат между пользователями
	chatID, err := s.repo.FindPrivateChat(senderID, recipientID)
	if err == nil {
		return chatID, nil
	}

	// Создаём новый чат только если его нет
	chat, err := s.CreatePrivateChat(senderID, recipientID)
	if err != nil {
		return "", err
	}

	return chat.ID, nil
}

func (s *ChatService) GetOrCreateChat(user1ID, user2ID string) (string, error) {
	// Проверяем существующие чаты пользователя
	chats, err := s.repo.GetUserChats(context.Background(), user1ID)
	if err != nil {
		return "", err
	}

	// Ищем существующий приватный чат с этим пользователем
	for _, chat := range chats {
		if !chat.IsGroup {
			for _, participant := range chat.Participants {
				if participant.ID == user2ID {
					return chat.ID, nil
				}
			}
		}
	}

	// Создаем новый чат
	chat, err := s.repo.CreatePrivateChat(user1ID, user2ID)
	if err != nil {
		return "", err
	}

	return chat.ID, nil
}

func (s *ChatService) GetChatParticipants(ctx context.Context, chatID string) ([]string, error) {
	return s.repo.GetChatParticipants(ctx, chatID)
}

func (s *ChatService) GetMessagesWithReadStatus(ctx context.Context, chatID, userID string, limit, offset int) ([]map[string]interface{}, error) {
	messages, err := s.repo.GetMessages(ctx, chatID, limit, offset)
	if err != nil {
		return nil, err
	}

	var result []map[string]interface{}
	for _, msg := range messages {
		isRead, _ := s.repo.IsMessageRead(msg.ID, userID)

		result = append(result, map[string]interface{}{
			"id":        msg.ID,
			"text":      msg.Text,
			"sent_at":   msg.SentAt,
			"sender":    msg.Sender,
			"isRead":    isRead,
			"sender_id": msg.SenderID,
		})
	}

	return result, nil
}

func (s *ChatService) MarkMessageRead(ctx context.Context, messageID, userID string) error {
	return s.repo.MarkMessageRead(messageID, userID)
}

func (s *ChatService) GetUserChats(ctx context.Context, userID string) ([]model.ChatRoom, error) {
	chats, err := s.repo.GetUserChats(ctx, userID)
	if err != nil {
		return nil, err
	}

	for i := range chats {
		count, err := s.repo.CountUnreadMessages(chats[i].ID, userID)
		if err == nil {
			chats[i].UnreadCount = count
		}
	}

	return chats, nil
}

func (s *ChatService) SaveMessage(ctx context.Context, chatID, senderID, text string) (*model.ChatMessage, error) {
	message := &model.ChatMessage{
		ChatID:   chatID,
		SenderID: senderID,
		Text:     text,
	}

	if err := s.repo.SaveMessage(ctx, message); err != nil {
		return nil, fmt.Errorf("failed to save message: %w", err)
	}

	return message, nil
}

func (s *ChatService) GetMessages(ctx context.Context, chatID string, limit, offset int) ([]model.ChatMessage, error) {
	return s.repo.GetMessages(ctx, chatID, limit, offset)
}

func (s *ChatService) CreatePrivateChat(user1ID, user2ID string) (*model.ChatRoom, error) {
	return s.repo.CreatePrivateChat(user1ID, user2ID)
}

func (s *ChatService) GetMessageWithSender(ctx context.Context, messageID string) (*model.ChatMessage, error) {
	return s.repo.GetMessageWithSender(ctx, messageID)

}
