package main

import (
	"admin/panel/configs"
	"admin/panel/internal/auth"
	"admin/panel/pkg/database"
	"fmt"
	"net/http"
)

func main() {
	conf := configs.LoadConfig()
	_ = database.NewDb(conf)
	router := http.NewServeMux()
	tokenService := &auth.TokenServiceImpl{SecretKey: conf.Auth.Secret}

	auth.NewAuthHandler(router, auth.AuthHandlerDeps{Config: conf, TokenService: tokenService})

	server := http.Server{
		Addr:    ":8081",
		Handler: router,
	}

	fmt.Println("Server is listening on port 8081")
	server.ListenAndServe()
}
