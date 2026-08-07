package database

import (
	"fmt"

	"admin/panel/internal/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Open(config config.Database) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(config.DSN()), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("open PostgreSQL connection: %w", err)
	}
	return db, nil
}

func Close(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("get SQL connection: %w", err)
	}
	if err := sqlDB.Close(); err != nil {
		return fmt.Errorf("close SQL connection: %w", err)
	}
	return nil
}
