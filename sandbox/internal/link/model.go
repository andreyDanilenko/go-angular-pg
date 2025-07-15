package link

import (
	"fmt"

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
		Hash: generateRandomHash(),
	}
}

// generateSimpleHash создает короткий хэш на основе URL и случайного числа
func generateRandomHash() string {
	b := make([]byte, 16)
	rand.Read(b)
	return fmt.Sprintf("%x", b)
}
