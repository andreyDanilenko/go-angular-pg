package main

import (
	"admin/panel/testJWT/internal/config"
	"admin/panel/testJWT/internal/model"
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

	// Выполняем миграции для всех моделей
	err = db.AutoMigrate(
		&model.User{},
		&model.Article{},
		// Добавьте другие модели по мере необходимости
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	log.Println("Migration completed successfully")
}
