package main

import (
	"admin/panel/internal/config"
	"admin/panel/internal/model"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	cfg := config.LoadConfig()

	// Формируем DSN строку для подключения
	dsn := "host=" + cfg.DBHost +
		" user=" + cfg.DBUser +
		" password=" + cfg.DBPassword +
		" dbname=" + cfg.DBName +
		" port=" + cfg.DBPort +
		" sslmode=disable TimeZone=UTC"

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	if err := db.Migrator().DropTable(&model.ChatMessage{}, &model.ChatParticipant{}, &model.ChatRoom{}, &model.ChatMessageRead{}, &model.User{}, &model.Article{}, &model.EmailConfirmation{}); err != nil {
		log.Printf("Warning: failed to drop chat_messages table: %v", err)
	}

	// // Выполняем миграции для всех моделей
	// err = db.AutoMigrate(
	// 	&model.User{},
	// 	&model.Article{},
	// 	&model.ChatRoom{},
	// 	&model.ChatParticipant{},
	// 	&model.ChatMessageRead{},
	// 	&model.ChatMessage{},
	// )
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	log.Println("Migration completed successfully")
}
