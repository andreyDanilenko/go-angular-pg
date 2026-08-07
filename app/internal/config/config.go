package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/joho/godotenv"
)

var loadEnvironmentOnce sync.Once

type Database struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
}

func (d Database) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		d.Host,
		d.Port,
		d.User,
		d.Password,
		d.Name,
		d.SSLMode,
	)
}

type API struct {
	Database       Database
	Address        string
	JWTSecret      string
	AllowedOrigins []string
}

type Worker struct {
	Database       Database
	HealthAddress  string
	PollInterval   time.Duration
	StaleAfter     time.Duration
	BatchSize      int
	MaximumAttempts int
}

type Email struct {
	Worker       Worker
	SMTPHost     string
	SMTPPort     string
	SMTPUsername string
	SMTPPassword string
	TemplatePath string
}

type Telegram struct {
	Worker   Worker
	BotToken string
	ChatID   int64
}

func LoadAPI() (API, error) {
	loadEnvironment()
	secret := strings.TrimSpace(os.Getenv("JWT_SECRET"))
	if secret == "" {
		return API{}, fmt.Errorf("JWT_SECRET is required")
	}

	origins := splitCSV(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:4200"))
	if len(origins) == 0 {
		return API{}, fmt.Errorf("CORS_ALLOWED_ORIGINS must contain at least one origin")
	}

	return API{
		Database:       loadDatabase(),
		Address:        getEnv("API_ADDRESS", ":8080"),
		JWTSecret:      secret,
		AllowedOrigins: origins,
	}, nil
}

func LoadEmail() (Email, error) {
	loadEnvironment()
	worker, err := loadWorker("EMAIL", ":8082")
	if err != nil {
		return Email{}, err
	}

	config := Email{
		Worker:       worker,
		SMTPHost:     strings.TrimSpace(os.Getenv("SMTP_HOST")),
		SMTPPort:     strings.TrimSpace(os.Getenv("SMTP_PORT")),
		SMTPUsername: strings.TrimSpace(os.Getenv("SMTP_USERNAME")),
		SMTPPassword: os.Getenv("SMTP_PASSWORD"),
		TemplatePath: getEnv("EMAIL_TEMPLATE_PATH", "templates/email_template.html"),
	}
	if config.SMTPHost == "" || config.SMTPPort == "" || config.SMTPUsername == "" || config.SMTPPassword == "" {
		return Email{}, fmt.Errorf("SMTP_HOST, SMTP_PORT, SMTP_USERNAME and SMTP_PASSWORD are required")
	}
	return config, nil
}

func LoadTelegram() (Telegram, error) {
	loadEnvironment()
	worker, err := loadWorker("TELEGRAM", ":8083")
	if err != nil {
		return Telegram{}, err
	}

	token := strings.TrimSpace(os.Getenv("TELEGRAM_BOT_TOKEN"))
	if token == "" {
		return Telegram{}, fmt.Errorf("TELEGRAM_BOT_TOKEN is required")
	}
	chatID, err := strconv.ParseInt(strings.TrimSpace(os.Getenv("TELEGRAM_CHAT_ID")), 10, 64)
	if err != nil {
		return Telegram{}, fmt.Errorf("TELEGRAM_CHAT_ID must be an integer: %w", err)
	}

	return Telegram{Worker: worker, BotToken: token, ChatID: chatID}, nil
}

func loadWorker(prefix string, defaultHealthAddress string) (Worker, error) {
	pollInterval, err := time.ParseDuration(getEnv(prefix+"_POLL_INTERVAL", "1s"))
	if err != nil || pollInterval <= 0 {
		return Worker{}, fmt.Errorf("%s_POLL_INTERVAL must be a positive duration", prefix)
	}
	staleAfter, err := time.ParseDuration(getEnv(prefix+"_STALE_AFTER", "2m"))
	if err != nil || staleAfter <= 0 {
		return Worker{}, fmt.Errorf("%s_STALE_AFTER must be a positive duration", prefix)
	}
	batchSize, err := positiveInt(prefix+"_BATCH_SIZE", 10)
	if err != nil {
		return Worker{}, err
	}
	maximumAttempts, err := positiveInt(prefix+"_MAX_ATTEMPTS", 5)
	if err != nil {
		return Worker{}, err
	}

	return Worker{
		Database:        loadDatabase(),
		HealthAddress:   getEnv(prefix+"_HEALTH_ADDRESS", defaultHealthAddress),
		PollInterval:    pollInterval,
		StaleAfter:      staleAfter,
		BatchSize:       batchSize,
		MaximumAttempts: maximumAttempts,
	}, nil
}

func loadDatabase() Database {
	return Database{
		Host:     getEnv("DB_HOST", "localhost"),
		Port:     getEnv("DB_PORT", "5432"),
		User:     getEnv("DB_USER", "postgres"),
		Password: getEnv("DB_PASSWORD", "my_pass"),
		Name:     getEnv("DB_NAME", "auth_service"),
		SSLMode:  getEnv("DB_SSL_MODE", "disable"),
	}
}

func loadEnvironment() {
	loadEnvironmentOnce.Do(func() {
		_ = godotenv.Load()
	})
}

func positiveInt(key string, fallback int) (int, error) {
	value, err := strconv.Atoi(getEnv(key, strconv.Itoa(fallback)))
	if err != nil || value <= 0 {
		return 0, fmt.Errorf("%s must be a positive integer", key)
	}
	return value, nil
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		if trimmed := strings.TrimSpace(part); trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
