package main

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"

	_ "github.com/lib/pq"
)

func main() {
	// Подключение без GORM для raw SQL
	db, err := sql.Open("postgres", fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Применяем все SQL-файлы из migrations
	files, err := ioutil.ReadDir("migrations")
	if err != nil {
		log.Fatal(err)
	}

	for _, file := range files {
		if filepath.Ext(file.Name()) == ".sql" {
			content, err := ioutil.ReadFile(filepath.Join("migrations", file.Name()))
			if err != nil {
				log.Printf("Failed to read %s: %v", file.Name(), err)
				continue
			}

			_, err = db.Exec(string(content))
			if err != nil {
				log.Printf("Failed to execute %s: %v", file.Name(), err)
			} else {
				log.Printf("Applied %s successfully", file.Name())
			}
		}
	}
}
