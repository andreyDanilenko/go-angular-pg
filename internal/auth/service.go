package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// type authServiceImpl struct {
//     userRepository UserRepository // Репозиторий для работы с БД
// }

type TokenService interface {
	GenerateToken(userID string) (string, error)
}

// type AuthService interface {
// 	Authenticate(email, password string) (*User, error)
// }

type tokenServiceImpl struct {
	secretKey string
}

func (s *tokenServiceImpl) GenerateToken(userID string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	})

	return token.SignedString([]byte(s.secretKey))
}

// func (s *authServiceImpl) Authenticate(email, password string) (*User, error) {
//     user, err := s.userRepository.FindByEmail(email)
//     if err != nil {
//         return nil, errors.New("user not found")
//     }

//     // Сравниваем хеш пароля из БД с присланным
//     if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
//         return nil, errors.New("invalid password")
//     }

//     return user, nil
// }
