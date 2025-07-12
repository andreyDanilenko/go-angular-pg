package main

import (
	"admin/panel/testJWT/internal/config"
	"admin/panel/testJWT/internal/handler"
	"admin/panel/testJWT/internal/middleware"
	"admin/panel/testJWT/internal/repository"
	"admin/panel/testJWT/internal/service"
	"database/sql"
	"fmt"
	"log"
	"net/http"

	_ "github.com/lib/pq"
)

func main() {
	cfg := config.LoadConfig()

	db, err := sql.Open("postgres", fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName,
	))
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	// Инициализация зависимостей
	userRepo := repository.NewUserRepository(db)
	articleRepo := repository.NewArticleRepository(db)
	authService := service.NewAuthService(userRepo, cfg.JWTSecret)
	articleService := service.NewArticleService(articleRepo)
	authHandler := handler.NewAuthHandler(authService)
	articleHandler := handler.NewArticleHandler(articleService)

	// Настройка роутера
	router := http.NewServeMux()
	router.HandleFunc("GET /articles/{id}", articleHandler.GetArticle)
	router.HandleFunc("POST /signup", authHandler.SignUp)
	router.HandleFunc("POST /signin", authHandler.SignIn)
	router.Handle("POST /articles",
		middleware.JWTAuth(cfg.JWTSecret)(
			http.HandlerFunc(articleHandler.CreateArticle),
		),
	)

	// Запуск сервера
	log.Println("Server is running on port 8080")
	if err := http.ListenAndServe(":8080", router); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
