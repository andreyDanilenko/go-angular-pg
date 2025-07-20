package service

import (
	"admin/panel/internal/model"
	"admin/panel/internal/repository"
	"context"
	"fmt"
)

type ChatService struct {
	repo *repository.ChatRepository
}

func NewChatService(repo *repository.ChatRepository) *ChatService {
	return &ChatService{repo: repo}
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

func (s *ChatService) GetUserChats(ctx context.Context, userID string) ([]model.ChatRoom, error) {
	return s.repo.GetUserChats(ctx, userID)
}

func (s *ChatService) CreatePrivateChat(user1ID, user2ID string) (*model.ChatRoom, error) {
	return s.repo.CreatePrivateChat(user1ID, user2ID)
}

func (s *ChatService) GetMessageWithSender(ctx context.Context, messageID string) (*model.ChatMessage, error) {
	return s.repo.GetMessageWithSender(ctx, messageID)

}
