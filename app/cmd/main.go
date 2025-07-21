package main

import (
	"admin/panel/internal/apierror"
	"admin/panel/internal/apiresponse"
	"admin/panel/internal/config"
	"admin/panel/internal/handler"
	"admin/panel/internal/middleware"
	"admin/panel/internal/model"
	"admin/panel/internal/repository"
	"admin/panel/internal/service"
	"admin/panel/internal/ws"
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	cfg := config.LoadConfig()

	gormDB, err := gorm.Open(postgres.Open(fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName,
	)), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to initialize GORM: %v", err)
	}

	sqlDB, err := gormDB.DB()
	if err != nil {
		log.Fatalf("Failed to get underlying DB connection: %v", err)
	}
	defer sqlDB.Close()

	if err := gormDB.Migrator().DropTable(&model.ChatMessage{}, &model.ChatParticipant{}, &model.ChatRoom{}, &model.ChatMessageRead{}); err != nil {
		log.Printf("Warning: failed to drop chat_messages table: %v", err)
	}

	if err := gormDB.AutoMigrate(
		&model.ChatRoom{},
		&model.ChatParticipant{},
		&model.ChatMessageRead{},
		&model.ChatMessage{},
	); err != nil {
		log.Fatalf("AutoMigrate failed: %v", err)
	}

	errorWriter := apierror.New()
	responseWriter := apiresponse.New()

	// Существующие репозитории, сервисы и хендлеры...
	userRepo := repository.NewUserRepository(gormDB)
	articleRepo := repository.NewArticleRepository(gormDB)
	authService := service.NewUserService(userRepo, cfg.JWTSecret)
	articleService := service.NewArticleService(articleRepo)
	authHandler := handler.NewUserHandler(authService, errorWriter, responseWriter)
	articleHandler := handler.NewArticleHandler(articleService)
	dumpHandler := handler.NewDumpHandler(gormDB)

	// Новый чат
	chatRepo := repository.NewChatRepository(gormDB)
	chatService := service.NewChatService(chatRepo)
	hub := ws.NewHub(chatService) // Передаем сервис в хаб
	// Запускаем хаб в отдельной горутине
	go hub.Run()
	chatHandler := handler.NewChatHandler(chatService, hub, errorWriter, responseWriter)

	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:4200", "https://lifedream.tech", "https://www.lifedream.tech"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
	r.Use(middleware.Logger)

	r.Route("/api", func(r chi.Router) {
		// Публичные маршруты
		r.Group(func(r chi.Router) {
			r.Post("/signup", authHandler.SignUp)
			r.Post("/signin", authHandler.SignIn)
			r.Get("/articles/all", articleHandler.GetAllArticles)
			r.Get("/articles/{id}", articleHandler.GetArticle)
			r.Get("/dump", dumpHandler.ServeHTTP)

		})

		r.With(middleware.JWTFromQuery(cfg.JWTSecret, errorWriter)).
			Get("/ws", chatHandler.ServeWS)

		// Защищённые маршруты
		r.Group(func(r chi.Router) {
			r.Use(middleware.JWTAuth(cfg.JWTSecret, errorWriter))

			r.Get("/users", authHandler.GetUsers)
			r.Get("/users/{id}", authHandler.GetUserByID)
			r.Put("/users/{id}", authHandler.UpdateUser)

			r.Get("/articles", articleHandler.GetUserArticles)
			r.Post("/articles", articleHandler.CreateArticle)
			r.Put("/articles/{id}", articleHandler.UpdateArticle)
			r.Delete("/articles/{id}", articleHandler.DeleteArticle)

			// WebSocket для чата
			// r.Get("/ws", chatHandler.ServeWS)
			r.Get("/chat/messages", chatHandler.GetMessages)
			r.Post("/chat/create-private", chatHandler.CreatePrivateChat)
			r.Get("/chat/user-chats", chatHandler.GetUserChats)
		})
	})

	log.Println("Server is running on port 8081")
	if err := http.ListenAndServe(":8081", r); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
