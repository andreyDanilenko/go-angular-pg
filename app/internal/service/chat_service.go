package service

import (
	"admin/panel/internal/model"
	"admin/panel/internal/repository"
	"context"
)

type ChatService struct {
	repo *repository.ChatRepository
}

func NewChatService(repo *repository.ChatRepository) *ChatService {
	return &ChatService{repo: repo}
}

func (s *ChatService) SaveMessage(ctx context.Context, msg *model.ChatMessage) error {
	return s.repo.SaveMessage(ctx, msg)
}

func (s *ChatService) GetMessagesBetween(ctx context.Context, fromID, toID string) ([]model.ChatMessage, error) {
	return s.repo.GetMessagesBetween(ctx, fromID, toID)
}
