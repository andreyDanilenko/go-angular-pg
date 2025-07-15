package main

import (
	"admin/panel/sandbox/configs"
	"admin/panel/sandbox/internal/auth"
	"admin/panel/sandbox/internal/sendEmail"
	"admin/panel/sandbox/internal/token"
	"admin/panel/sandbox/pkg/database"
	"fmt"
	"net/http"
	"time"
)

func main() {
	conf := configs.LoadConfig()
	_ = database.NewDb(conf)
	router := http.NewServeMux()
	tokenService := token.NewService(
		conf.Auth.Secret, // Секретный ключ из конфига
		24*time.Hour,     // Время жизни access токена
	)
	auth.NewAuthHandler(router, auth.AuthHandlerDeps{Config: conf, TokenService: tokenService})
	sendEmail.Setup(router, conf)

	server := http.Server{
		Addr:    ":8081",
		Handler: router,
	}

	fmt.Println("Server is listening on port 8081")
	server.ListenAndServe()
}
