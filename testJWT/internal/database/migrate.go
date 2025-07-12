package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
)

func ApplyMigrations(db *sql.DB) error {
	migrationsPath := "migrations"

	// Читаем все файлы в директории миграций
	files, err := os.ReadDir(migrationsPath)
	if err != nil {
		return fmt.Errorf("failed to read migrations directory: %w", err)
	}

	// Сортируем файлы по имени
	sort.Slice(files, func(i, j int) bool {
		return files[i].Name() < files[j].Name()
	})

	// Применяем каждую миграцию по порядку
	for _, file := range files {
		if filepath.Ext(file.Name()) == ".sql" {
			filePath := filepath.Join(migrationsPath, file.Name())
			migrationSQL, err := os.ReadFile(filePath)
			if err != nil {
				return fmt.Errorf("failed to read migration file %s: %w", file.Name(), err)
			}

			log.Printf("Applying migration: %s\n", file.Name())
			if _, err := db.Exec(string(migrationSQL)); err != nil {
				return fmt.Errorf("failed to execute migration %s: %w", file.Name(), err)
			}
		}
	}

	return nil
}
