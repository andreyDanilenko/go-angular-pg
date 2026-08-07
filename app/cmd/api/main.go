package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"admin/panel/internal/apierror"
	"admin/panel/internal/apiresponse"
	"admin/panel/internal/config"
	"admin/panel/internal/database"
	"admin/panel/internal/handler"
	"admin/panel/internal/health"
	appmiddleware "admin/panel/internal/middleware"
	"admin/panel/internal/model"
	"admin/panel/internal/notification"
	"admin/panel/internal/repository"
	"admin/panel/internal/service"
	"admin/panel/internal/utils"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	if err := run(logger); err != nil {
		logger.Error("API stopped", "error", err)
		os.Exit(1)
	}
}

func run(logger *slog.Logger) error {
	appConfig, err := config.LoadAPI()
	if err != nil {
		return err
	}
	db, err := database.Open(appConfig.Database)
	if err != nil {
		return err
	}
	defer func() {
		if closeErr := database.Close(db); closeErr != nil {
			logger.Error("failed to close database", "error", closeErr)
		}
	}()

	if err := db.AutoMigrate(
		&model.User{},
		&model.Article{},
		&model.EmailCode{},
		&model.NotificationJob{},
	); err != nil {
		return err
	}

	errorWriter := apierror.New()
	responseWriter := apiresponse.New()
	tokenManager := utils.NewJWTManager(appConfig.JWTSecret)
	outbox := notification.NewOutbox(db)
	userService := service.NewUserService(
		repository.NewUserRepository(db),
		outbox,
		tokenManager,
		logger,
	)
	articleService := service.NewArticleService(repository.NewArticleRepository(db))
	userHandler := handler.NewUserHandler(userService, errorWriter, responseWriter)
	articleHandler := handler.NewArticleHandler(articleService, errorWriter, responseWriter)
	healthHandler := health.NewHandler(db)

	router := chi.NewRouter()
	router.Use(chimiddleware.RequestID)
	router.Use(chimiddleware.RealIP)
	router.Use(chimiddleware.Recoverer)
	router.Use(appmiddleware.Logger(logger))
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   appConfig.AllowedOrigins,
		AllowedMethods:   []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodOptions},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
	router.Route("/api", func(router chi.Router) {
		router.Get("/health", healthHandler.Health)
		router.Get("/live", healthHandler.Live)
		router.Get("/ready", healthHandler.Ready)
		router.Post("/auth", userHandler.StartAuthFlow)
		router.Post("/confirm", userHandler.ConfirmCode)
		router.Get("/articles/all", articleHandler.GetAll)
		router.Get("/articles/{id}", articleHandler.GetByID)

		router.Group(func(router chi.Router) {
			router.Use(appmiddleware.JWTAuth(tokenManager, errorWriter))
			router.Get("/users/me", userHandler.GetCurrentUser)
			router.Put("/users/me", userHandler.UpdateCurrentUser)
			router.Get("/articles", articleHandler.GetCurrentUserArticles)
			router.Post("/articles", articleHandler.Create)
			router.Put("/articles/{id}", articleHandler.Update)
			router.Delete("/articles/{id}", articleHandler.Delete)
		})
	})

	server := &http.Server{
		Addr:              appConfig.Address,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	serverError := make(chan error, 1)
	go func() {
		logger.Info("API listening", "address", appConfig.Address)
		serverError <- server.ListenAndServe()
	}()

	select {
	case <-ctx.Done():
		shutdownContext, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		return server.Shutdown(shutdownContext)
	case err := <-serverError:
		if errors.Is(err, http.ErrServerClosed) {
			return nil
		}
		return err
	}
}
