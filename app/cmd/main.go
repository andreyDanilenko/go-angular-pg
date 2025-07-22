package main

import (
	"admin/panel/internal/apierror"
	"admin/panel/internal/apiresponse"
	"admin/panel/internal/config"
	"admin/panel/internal/handler"
	"admin/panel/internal/middleware"
	"admin/panel/internal/repository"
	"admin/panel/internal/service"
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
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

	// Настройка роутера
	r := chi.NewRouter()

	// Публичные маршруты
	r.Route("/api", func(r chi.Router) {
		r.Group(func(r chi.Router) {
			r.Post("/signup", authHandler.SignUp)
			r.Post("/signin", authHandler.SignIn)
			r.Get("/articles/all", articleHandler.GetAllArticles)
			r.Get("/articles/{id}", articleHandler.GetArticle)
		})

		// Защищенные маршруты (требуют JWT)
		r.Group(func(r chi.Router) {
			r.Use(middleware.JWTAuth(cfg.JWTSecret, errorWriter))

			r.Get("/articles", articleHandler.GetUserArticles)
			r.Post("/articles", articleHandler.CreateArticle)
			r.Put("/articles/{id}", articleHandler.UpdateArticle)
			r.Delete("/articles/{id}", articleHandler.DeleteArticle)
		})
	})
	// Запуск сервера
	log.Println("Server is running on port 8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
