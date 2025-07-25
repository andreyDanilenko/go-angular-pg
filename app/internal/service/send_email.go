package service

import (
	"admin/panel/internal/config"
	"bytes" // Для работы с буферами (построение тела письма)

	// Для генерации криптографически безопасных случайных чисел
	"fmt"           // Для форматирования строк
	"net/smtp"      // Для отправки email через SMTP
	"text/template" // Для работы с шаблонами писем
)

type EmailService struct {
	config *config.Config
}

func NewEmailService(cfg *config.Config) *EmailService {
	return &EmailService{
		config: cfg, // Инициализация конфигурации
	}
}

func (s *EmailService) SendEmail(email, hash string) error {
	cfg := s.config.SendEmail
	auth := smtp.PlainAuth(
		"Verify",         // identity (обычно пустое или название)
		cfg.SmtpUsername, // username (email отправителя)
		cfg.SmtpPassword, // пароль от почты
		cfg.SmtpHost,     // SMTP хост
	)

	verificationLink := fmt.Sprintf("%s/verify/%s", s.config.BaseURL, hash)

	// Парсим HTML шаблон письма
	tmpl, err := template.ParseFiles("templates/email_template.html")
	if err != nil {
		return fmt.Errorf("failed to parse template: %v", err)
	}

	// Создаем буфер для тела письма
	var body bytes.Buffer

	// Данные для подстановки в шаблон
	data := struct {
		VerificationLink string
	}{
		VerificationLink: verificationLink, // Ссылка для верификации
	}

	// Заполняем шаблон данными
	if err := tmpl.Execute(&body, data); err != nil {
		return fmt.Errorf("failed to execute template: %v", err)
	}

	// Формируем заголовки письма
	headers := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	subject := "Subject: Email Verification\n"

	// Собираем полное сообщение (тема + заголовки + тело)
	msg := []byte(subject + headers + body.String())

	// Отправляем письмо через SMTP сервер
	return smtp.SendMail(
		fmt.Sprintf("%s:%s", cfg.SmtpHost, cfg.SmtpPort), // Адрес SMTP сервера
		auth,             // Аутентификация
		cfg.SmtpUsername, // Отправитель
		[]string{email},  // Получатель(и)
		msg,              // Тело письма
	)
}
