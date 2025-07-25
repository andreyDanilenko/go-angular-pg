package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type EmailConfig struct {
	SmtpHost     string
	SmtpPort     string
	SmtpUsername string
	SmtpPassword string
}

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	JWTSecret  string
	SendEmail  EmailConfig
	BaseURL    string
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
		SendEmail: EmailConfig{
			SmtpHost:     os.Getenv("SMTP_HOST"),
			SmtpPort:     os.Getenv("SMTP_PORT"),
			SmtpUsername: os.Getenv("SMTP_USERNAME"),
			SmtpPassword: os.Getenv("SMTP_PASSWORD"),
		},
		BaseURL: "http://localhost:8080/api",
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
