package notification

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"admin/panel/internal/model"
)

type JobHandler interface {
	Handle(ctx context.Context, job model.NotificationJob) error
}

type Worker struct {
	outbox       *Outbox
	handler      JobHandler
	channel      model.NotificationChannel
	logger       *slog.Logger
	pollInterval time.Duration
	staleAfter   time.Duration
	batchSize    int
	maxAttempts  int
}

type WorkerConfig struct {
	PollInterval time.Duration
	StaleAfter   time.Duration
	BatchSize    int
	MaxAttempts  int
}

func NewWorker(
	outbox *Outbox,
	handler JobHandler,
	channel model.NotificationChannel,
	logger *slog.Logger,
	config WorkerConfig,
) *Worker {
	return &Worker{
		outbox:       outbox,
		handler:      handler,
		channel:      channel,
		logger:       logger,
		pollInterval: config.PollInterval,
		staleAfter:   config.StaleAfter,
		batchSize:    config.BatchSize,
		maxAttempts:  config.MaxAttempts,
	}
}

func (w *Worker) Run(ctx context.Context) error {
	ticker := time.NewTicker(w.pollInterval)
	defer ticker.Stop()

	for {
		if err := w.processBatch(ctx); err != nil {
			w.logger.Error("notification batch failed", "channel", w.channel, "error", err)
		}

		select {
		case <-ctx.Done():
			return nil
		case <-ticker.C:
		}
	}
}

func (w *Worker) processBatch(ctx context.Context) error {
	jobs, err := w.outbox.Claim(ctx, w.channel, w.batchSize, w.staleAfter)
	if err != nil {
		return err
	}

	for _, job := range jobs {
		if err := w.handler.Handle(ctx, job); err != nil {
			w.logger.Warn(
				"notification delivery failed",
				"job_id", job.ID,
				"kind", job.Kind,
				"attempt", job.Attempts,
				"error", err,
			)
			if markErr := w.outbox.MarkFailed(ctx, job, err, w.maxAttempts); markErr != nil {
				return fmt.Errorf("record delivery failure: %w", markErr)
			}
			continue
		}

		if err := w.outbox.MarkSent(ctx, job.ID); err != nil {
			return err
		}
		w.logger.Info("notification delivered", "job_id", job.ID, "kind", job.Kind)
	}

	return nil
}
