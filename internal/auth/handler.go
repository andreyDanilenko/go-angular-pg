package auth

import (
	"admin/panel/configs"
	"admin/panel/pkg/request"
	"admin/panel/pkg/response"

	// "admin/panel/pkg/validation"

	"fmt"
	"net/http"
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

// request из pkg/request
// response из pkg/response

func (handler *AuthHandler) Login() http.HandlerFunc {
	return func(w http.ResponseWriter, req *http.Request) {
		// 1. Декодируем body и валидируем данные
		body, err := request.HandleBody[LoginRequest](&w, req)
		if err != nil {
			response.Json(w, err.Error(), 422)
			return
		}

		// // 3. Аутентификация работа с базой данных
		// user, err := handler.authService.Authenticate(payload.Email, payload.Password)
		// if err != nil {
		// 	http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		// 	return
		// }

		// 4. Генерация токена
		token, err := handler.tokenService.GenerateToken(body.Password + body.Email)
		if err != nil {
			response.Json(w, err.Error(), 422)
			// http.Error(w, "Failed to generate token", http.StatusInternalServerError)
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
