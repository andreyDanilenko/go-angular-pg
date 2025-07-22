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

	if err := db.Migrator().DropTable(&model.ChatMessage{}, &model.ChatParticipant{}, &model.ChatRoom{}, &model.ChatMessageRead{}, &model.User{}, &model.Article{}); err != nil {
		log.Printf("Warning: failed to drop chat_messages table: %v", err)
	}

	if err := db.AutoMigrate(
		&model.ChatRoom{},
		&model.ChatParticipant{},
		&model.ChatMessageRead{},
		&model.ChatMessage{},
	); err != nil {
		log.Fatalf("AutoMigrate failed: %v", err)
	}

	// Выполняем миграции для всех моделей
	err = db.AutoMigrate(
		&model.User{},
		&model.Article{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	log.Println("Migration completed successfully")
}

// resetDatabase очищает все таблицы в базе данных
func resetDatabase(db *gorm.DB) error {
	// Получаем список всех таблиц в базе данных
	tables := []string{"users", "articles"} // Добавьте другие таблицы по необходимости

	// Отключаем проверку внешних ключей (для PostgreSQL)
	if err := db.Exec("SET session_replication_role = 'replica'").Error; err != nil {
		return err
	}

	// Удаляем все таблицы
	for _, table := range tables {
		if err := db.Migrator().DropTable(table); err != nil {
			return err
		}
		log.Printf("Dropped table: %s", table)
	}

	// Включаем проверку внешних ключей обратно
	if err := db.Exec("SET session_replication_role = 'origin'").Error; err != nil {
		return err
	}

	return nil
}

// truncateTables очищает данные из таблиц без удаления самих таблиц
func truncateTables(db *gorm.DB) error {
	tables := []string{"users", "articles"} // Добавьте другие таблицы по необходимости

	// Отключаем проверку внешних ключей
	if err := db.Exec("SET session_replication_role = 'replica'").Error; err != nil {
		return err
	}

	// Очищаем таблицы
	for _, table := range tables {
		if err := db.Exec("TRUNCATE TABLE " + table + " CASCADE").Error; err != nil {
			return err
		}
		log.Printf("Truncated table: %s", table)
	}

	// Включаем проверку внешних ключей обратно
	if err := db.Exec("SET session_replication_role = 'origin'").Error; err != nil {
		return err
	}

	return nil
}
