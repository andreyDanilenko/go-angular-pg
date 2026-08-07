package workerapp

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"time"

	"admin/panel/internal/config"
	"admin/panel/internal/health"
	"admin/panel/internal/model"
	"admin/panel/internal/notification"

	"gorm.io/gorm"
)

func Run(
	ctx context.Context,
	db *gorm.DB,
	channel model.NotificationChannel,
	handler notification.JobHandler,
	config config.Worker,
	logger *slog.Logger,
) error {
	outbox := notification.NewOutbox(db)
	worker := notification.NewWorker(
		outbox,
		handler,
		channel,
		logger,
		notification.WorkerConfig{
			PollInterval: config.PollInterval,
			StaleAfter:   config.StaleAfter,
			BatchSize:    config.BatchSize,
			MaxAttempts:  config.MaximumAttempts,
		},
	)

	healthHandler := health.NewHandler(db)
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", healthHandler.Health)
	mux.HandleFunc("GET /live", healthHandler.Live)
	mux.HandleFunc("GET /ready", healthHandler.Ready)
	healthServer := &http.Server{
		Addr:              config.HealthAddress,
		Handler:           mux,
		ReadHeaderTimeout: 3 * time.Second,
		ReadTimeout:       5 * time.Second,
		WriteTimeout:      5 * time.Second,
		IdleTimeout:       30 * time.Second,
	}

	result := make(chan error, 2)
	go func() { result <- worker.Run(ctx) }()
	go func() {
		logger.Info("worker health server listening", "address", config.HealthAddress, "channel", channel)
		result <- healthServer.ListenAndServe()
	}()

	select {
	case <-ctx.Done():
		shutdownContext, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := healthServer.Shutdown(shutdownContext); err != nil {
			return err
		}
		return nil
	case err := <-result:
		if errors.Is(err, http.ErrServerClosed) {
			return nil
		}
		return err
	}
}
