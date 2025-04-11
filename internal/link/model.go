package link

import (
	"crypto/md5"
	"encoding/hex"
	"time"

	"golang.org/x/exp/rand"
	"gorm.io/gorm"
)

type Link struct {
	gorm.Model
	Url  string `json:"url"`
	Hash string `json:"hash" gorm:"uniqueIndex"`
}

func NewLink(url string) *Link {
	return &Link{
		Url:  url,
		Hash: generateSimpleHash(url),
	}
}

// generateSimpleHash создает короткий хэш на основе URL и случайного числа
func generateSimpleHash(url string) string {
	// Инициализация генератора случайных чисел
	rand.Seed(time.Now().UnixNano())

	// Создаем MD5 хэш от URL + случайное число
	data := []byte(url + string(rand.Intn(1000000)))
	hash := md5.Sum(data)

	// Берем первые 6 символов хэша
	return hex.EncodeToString(hash[:])[:6]
}
