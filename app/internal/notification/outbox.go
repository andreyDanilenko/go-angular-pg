package notification

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"admin/panel/internal/model"

	"gorm.io/gorm"
)

const maxStoredErrorLength = 500

type EmailCodePayload struct {
	Code string `json:"code"`
}

type TelegramMessagePayload struct {
	Text string `json:"text"`
}

type Outbox struct {
	db *gorm.DB
}

func NewOutbox(db *gorm.DB) *Outbox {
	return &Outbox{db: db}
}

func (o *Outbox) EnqueueAuthRequest(
	ctx context.Context,
	code *model.EmailCode,
	email string,
) error {
	emailPayload, err := json.Marshal(EmailCodePayload{Code: code.Code})
	if err != nil {
		return fmt.Errorf("marshal email payload: %w", err)
	}

	telegramPayload, err := json.Marshal(TelegramMessagePayload{
		Text: fmt.Sprintf("🔔 Новый запрос авторизации\nEmail: %s", email),
	})
	if err != nil {
		return fmt.Errorf("marshal telegram payload: %w", err)
	}

	return o.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Delete(&model.EmailCode{}, "user_id = ?", code.UserID).Error; err != nil {
			return fmt.Errorf("remove previous email codes: %w", err)
		}
		if err := tx.Create(code).Error; err != nil {
			return fmt.Errorf("save email code: %w", err)
		}

		jobs := []model.NotificationJob{
			{
				Channel:        model.NotificationChannelEmail,
				Kind:           "auth_code",
				Recipient:      email,
				Payload:        string(emailPayload),
				IdempotencyKey: "auth-code:" + code.ID,
			},
			{
				Channel:        model.NotificationChannelTelegram,
				Kind:           "auth_requested",
				Payload:        string(telegramPayload),
				IdempotencyKey: "auth-requested:" + code.ID,
			},
		}
		if err := tx.Create(&jobs).Error; err != nil {
			return fmt.Errorf("enqueue auth notifications: %w", err)
		}
		return nil
	})
}

func (o *Outbox) EnqueueTelegram(
	ctx context.Context,
	kind string,
	idempotencyKey string,
	message string,
) error {
	payload, err := json.Marshal(TelegramMessagePayload{Text: message})
	if err != nil {
		return fmt.Errorf("marshal telegram payload: %w", err)
	}

	job := model.NotificationJob{
		Channel:        model.NotificationChannelTelegram,
		Kind:           kind,
		Payload:        string(payload),
		IdempotencyKey: idempotencyKey,
	}
	if err := o.db.WithContext(ctx).Create(&job).Error; err != nil {
		return fmt.Errorf("enqueue telegram notification: %w", err)
	}
	return nil
}

func (o *Outbox) Claim(
	ctx context.Context,
	channel model.NotificationChannel,
	limit int,
	staleAfter time.Duration,
) ([]model.NotificationJob, error) {
	if limit <= 0 {
		return nil, errorsNewInvalidLimit()
	}

	now := time.Now().UTC()
	staleBefore := now.Add(-staleAfter)
	jobs := make([]model.NotificationJob, 0, limit)
	query := `
		UPDATE notification_jobs
		SET status = ?, locked_at = ?, attempts = attempts + 1, updated_at = ?
		WHERE id IN (
			SELECT id
			FROM notification_jobs
			WHERE channel = ?
			  AND next_attempt_at <= ?
			  AND (
				status = ?
				OR (status = ? AND locked_at < ?)
			  )
			ORDER BY created_at
			FOR UPDATE SKIP LOCKED
			LIMIT ?
		)
		RETURNING *`

	if err := o.db.WithContext(ctx).Raw(
		query,
		model.NotificationStatusProcessing,
		now,
		now,
		channel,
		now,
		model.NotificationStatusPending,
		model.NotificationStatusProcessing,
		staleBefore,
		limit,
	).Scan(&jobs).Error; err != nil {
		return nil, fmt.Errorf("claim notification jobs: %w", err)
	}

	return jobs, nil
}

func (o *Outbox) MarkSent(ctx context.Context, jobID string) error {
	result := o.db.WithContext(ctx).
		Model(&model.NotificationJob{}).
		Where("id = ? AND status = ?", jobID, model.NotificationStatusProcessing).
		Updates(map[string]any{
			"status":     model.NotificationStatusSent,
			"locked_at":  nil,
			"last_error": "",
		})
	if result.Error != nil {
		return fmt.Errorf("mark notification sent: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("mark notification sent: job %s is not processing", jobID)
	}
	return nil
}

func (o *Outbox) MarkFailed(
	ctx context.Context,
	job model.NotificationJob,
	deliveryError error,
	maxAttempts int,
) error {
	status := model.NotificationStatusPending
	if job.Attempts >= maxAttempts {
		status = model.NotificationStatusDead
	}

	retryDelay := time.Duration(1<<min(job.Attempts, 8)) * time.Second
	message := strings.TrimSpace(deliveryError.Error())
	if len(message) > maxStoredErrorLength {
		message = message[:maxStoredErrorLength]
	}

	updates := map[string]any{
		"status":          status,
		"locked_at":       nil,
		"last_error":      message,
		"next_attempt_at": time.Now().UTC().Add(retryDelay),
	}
	if err := o.db.WithContext(ctx).
		Model(&model.NotificationJob{}).
		Where("id = ?", job.ID).
		Updates(updates).Error; err != nil {
		return fmt.Errorf("mark notification failed: %w", err)
	}
	return nil
}

func errorsNewInvalidLimit() error {
	return fmt.Errorf("claim limit must be positive")
}
