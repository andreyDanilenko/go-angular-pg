package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	JWTSecret  string
}

func LoadConfig() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	return &Config{
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: getEnv("DB_PASSWORD", "my_pass"),
		DBName:     getEnv("DB_NAME", "auth_service"),
		JWTSecret:  getEnv("JWT_SECRET", "very-secret-key"),
	}
}

// docker run -d --name auth_service \
//   -e POSTGRES_PASSWORD=my_pass \
//   -e POSTGRES_USER=postgres \
//   -e POSTGRES_DB=auth_service \
//   -p 5432:5432 \
//   postgres:17.4

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
