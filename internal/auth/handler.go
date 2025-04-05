package auth

import (
	"admin/panel/configs"
	"admin/panel/pkg/response"

	// "admin/panel/pkg/validation"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-playground/validator"
)

type AuthHandler struct {
	// authService  AuthService  // Сервис для работы с аутентификацией
	tokenService TokenService // Сервис для работы с JWT
	*configs.Config
}

type AuthHandlerDeps struct {
	TokenService TokenService // Сервис для работы с JWT
	*configs.Config
}

func NewAuthHandler(router *http.ServeMux, deps AuthHandlerDeps) {
	handler := &AuthHandler{
		tokenService: deps.TokenService,
		Config:       deps.Config,
	}
	router.HandleFunc("POST /auth/login", handler.Login())
	router.HandleFunc("POST /auth/register", handler.Register())
}

func (handler *AuthHandler) Login() http.HandlerFunc {
	return func(w http.ResponseWriter, req *http.Request) {
		// получить body
		var payload LoginRequest
		// 1. Парсим JSON
		err := json.NewDecoder(req.Body).Decode(&payload)

		if err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		// 2. Валидация (можно использовать github.com/go-playground/validator)
		// if payload.Email == "" || payload.Password == "" {
		// 	http.Error(w, "Email and password are required", http.StatusUnprocessableEntity)
		// 	return
		// }

		// if !validation.ValidateEmail(payload.Email) {
		// 	http.Error(w, "Wrong email", http.StatusUnprocessableEntity)
		// 	return
		// }

		validation := validator.New()
		err = validation.Struct(payload)
		if err != nil {
			response.Json(w, err.Error(), 402)
			return
		}

		// // 3. Аутентификация работа с базой данных
		// user, err := handler.authService.Authenticate(payload.Email, payload.Password)
		// if err != nil {
		// 	http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		// 	return
		// }

		// 4. Генерация токена
		token, err := handler.tokenService.GenerateToken(payload.Password + payload.Email)
		if err != nil {
			http.Error(w, "Failed to generate token", http.StatusInternalServerError)
			return
		}

		// 5. Формируем ответ
		data := LoginResponse{
			Token: token,
		}

		// 6. Отправка ответа
		response.Json(w, data, 200)
	}
}

func (handler *AuthHandler) Register() http.HandlerFunc {
	return func(w http.ResponseWriter, req *http.Request) {
		fmt.Println("Register")
	}
}
