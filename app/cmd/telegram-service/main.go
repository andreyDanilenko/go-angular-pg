package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"admin/panel/internal/config"
	"admin/panel/internal/database"
	"admin/panel/internal/model"
	"admin/panel/internal/telegram"
	"admin/panel/internal/workerapp"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	if err := run(logger); err != nil {
		logger.Error("Telegram service stopped", "error", err)
		os.Exit(1)
	}
}

func run(logger *slog.Logger) error {
	appConfig, err := config.LoadTelegram()
	if err != nil {
		return err
	}
	db, err := database.Open(appConfig.Worker.Database)
	if err != nil {
		return err
	}
	defer func() {
		if closeErr := database.Close(db); closeErr != nil {
			logger.Error("failed to close database", "error", closeErr)
		}
	}()

	sender, err := telegram.NewSender(appConfig.BotToken, appConfig.ChatID)
	if err != nil {
		return err
	}
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	return workerapp.Run(ctx, db, model.NotificationChannelTelegram, sender, appConfig.Worker, logger)
}
