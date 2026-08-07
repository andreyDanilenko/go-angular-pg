package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type NotificationChannel string

const (
	NotificationChannelEmail    NotificationChannel = "email"
	NotificationChannelTelegram NotificationChannel = "telegram"
)

type NotificationStatus string

const (
	NotificationStatusPending    NotificationStatus = "pending"
	NotificationStatusProcessing NotificationStatus = "processing"
	NotificationStatusSent       NotificationStatus = "sent"
	NotificationStatusDead       NotificationStatus = "dead"
)

type NotificationJob struct {
	ID             string              `gorm:"primaryKey;size:36"`
	Channel        NotificationChannel `gorm:"size:20;not null;index:idx_notification_ready,priority:1"`
	Kind           string              `gorm:"size:50;not null"`
	Recipient      string              `gorm:"size:255"`
	Payload        string              `gorm:"type:jsonb;not null"`
	IdempotencyKey string              `gorm:"size:255;not null;uniqueIndex"`
	Status         NotificationStatus  `gorm:"size:20;not null;index:idx_notification_ready,priority:2"`
	Attempts       int                 `gorm:"not null;default:0"`
	NextAttemptAt  time.Time           `gorm:"not null;index:idx_notification_ready,priority:3"`
	LockedAt       *time.Time
	LastError      string    `gorm:"size:500"`
	CreatedAt      time.Time `gorm:"autoCreateTime"`
	UpdatedAt      time.Time `gorm:"autoUpdateTime"`
}

func (j *NotificationJob) BeforeCreate(_ *gorm.DB) error {
	if j.ID == "" {
		j.ID = uuid.NewString()
	}
	if j.Status == "" {
		j.Status = NotificationStatusPending
	}
	if j.NextAttemptAt.IsZero() {
		j.NextAttemptAt = time.Now().UTC()
	}
	return nil
}
