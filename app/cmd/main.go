package main

import (
	"admin/panel/internal/apierror"
	"admin/panel/internal/apiresponse"
	"admin/panel/internal/config"
	"admin/panel/internal/handler"
	"admin/panel/internal/middleware"
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

	// Инициализация GORM
	gormDB, err := gorm.Open(postgres.Open(fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName,
	)), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to initialize GORM: %v", err)
	}

	// Получаем *sql.DB из GORM для обратной совместимости
	db, err := gormDB.DB()
	if err != nil {
		log.Fatalf("Failed to get underlying DB connection: %v", err)
	}
	defer db.Close()

	errorWriter := apierror.New()
	responseWriter := apiresponse.New()

	// Инициализация зависимостей
	userRepo := repository.NewUserRepository(gormDB)
	articleRepo := repository.NewArticleRepository(gormDB)
	authService := service.NewUserService(userRepo, cfg.JWTSecret)
	articleService := service.NewArticleService(articleRepo)
	authHandler := handler.NewUserHandler(authService, errorWriter, responseWriter)
	articleHandler := handler.NewArticleHandler(articleService)
	dumpHandler := handler.NewDumpHandler(gormDB)

	// web sockets
	chatRepo := repository.NewChatRepository(gormDB)
	chatService := service.NewChatService(chatRepo)
	hub := ws.NewHub(chatService)
	go hub.Run()
	chatHandler := handler.NewChatHandler(chatService, hub, errorWriter, responseWriter)

	// Настройка роутера
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

	// Публичные маршруты
	r.Route("/api", func(r chi.Router) {
		// Публичные маршруты
		r.Group(func(r chi.Router) {
			r.Post("/signup", authHandler.SignUp)
			r.Post("/signin", authHandler.SignIn)
			r.Get("/articles/all", articleHandler.GetAllArticles)
			r.Get("/articles/{id}", articleHandler.GetArticle)
			r.Get("/dump", dumpHandler.ServeHTTP)
		})

		r.Group(func(r chi.Router) {
			r.Use(middleware.JWTFromQuery(cfg.JWTSecret, errorWriter))

			// WebSocket для чата
			r.Get("/ws", chatHandler.ServeWS)
		})

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
			r.Get("/chat/messages", chatHandler.GetMessages)
			r.Post("/chat/create-private", chatHandler.CreatePrivateChat)
			r.Get("/chat/user-chats", chatHandler.GetUserChats)
		})
	})

	// Запуск сервера
	log.Println("Server is running on port 8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
