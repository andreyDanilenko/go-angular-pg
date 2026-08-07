package telegram

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"admin/panel/internal/model"
	"admin/panel/internal/notification"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

type Sender struct {
	bot    *tgbotapi.BotAPI
	chatID int64
}

func NewSender(token string, chatID int64) (*Sender, error) {
	bot, err := tgbotapi.NewBotAPI(token)
	if err != nil {
		return nil, fmt.Errorf("create Telegram client: %w", err)
	}
	return &Sender{bot: bot, chatID: chatID}, nil
}

func (s *Sender) Handle(ctx context.Context, job model.NotificationJob) error {
	if err := ctx.Err(); err != nil {
		return err
	}

	var payload notification.TelegramMessagePayload
	if err := json.Unmarshal([]byte(job.Payload), &payload); err != nil {
		return fmt.Errorf("decode Telegram payload: %w", err)
	}
	if strings.TrimSpace(payload.Text) == "" {
		return fmt.Errorf("Telegram message is empty")
	}

	if _, err := s.bot.Send(tgbotapi.NewMessage(s.chatID, payload.Text)); err != nil {
		return fmt.Errorf("send Telegram message: %w", err)
	}
	return nil
}
