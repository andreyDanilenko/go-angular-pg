package configs

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	BaseURL   string
	Db        DbConfig
	Auth      AuthConfig
	SendEmail EmailConfig
}

type DbConfig struct {
	Dsn string
}

type AuthConfig struct {
	Secret string
}

type EmailConfig struct {
	SmtpHost     string
	SmtpPort     string
	SmtpUsername string
	SmtpPassword string
}

func LoadConfig() *Config {
	err := godotenv.Load()

	if err != nil {
		log.Println("Error loading .env")
	}

	return &Config{
		BaseURL: os.Getenv("BASE_URL"),
		Db: DbConfig{
			Dsn: os.Getenv("DSN"),
		},
		Auth: AuthConfig{
			Secret: os.Getenv("TOKEN"),
		},
		SendEmail: EmailConfig{
			SmtpHost:     os.Getenv("SMTP_HOST"),
			SmtpPort:     os.Getenv("SMTP_PORT"),
			SmtpUsername: os.Getenv("SMTP_USERNAME"),
			SmtpPassword: os.Getenv("SMTP_PASSWORD"),
		},
	}
}
