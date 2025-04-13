package sendEmail

import (
	"admin/panel/configs"                // Импорт конфигурации приложения
	"admin/panel/internal/sendEmail/dto" // DTO для работы с записями верификации
	"bytes"                              // Для работы с буферами (построение тела письма)
	"crypto/rand"                        // Для генерации криптографически безопасных случайных чисел
	"fmt"                                // Для форматирования строк
	"net/smtp"                           // Для отправки email через SMTP
	"text/template"                      // Для работы с шаблонами писем
)

// EmailService - сервис для работы с email
type EmailService struct {
	config     *configs.Config // Конфигурация приложения (SMTP настройки и др.)
	repository *Repository     // Репозиторий для хранения записей верификации
}

// NewEmailService - конструктор для создания EmailService
// Принимает:
// - cfg: конфигурация приложения
// - repo: репозиторий для хранения записей верификации
// Возвращает:
// - Указатель на созданный EmailService
func NewEmailService(cfg *configs.Config, repo *Repository) *EmailService {
	return &EmailService{
		config:     cfg,  // Инициализация конфигурации
		repository: repo, // Инициализация репозитория
	}
}

// SendVerificationEmail отправляет email с ссылкой для верификации
// Принимает:
// - email: адрес электронной почты получателя
// Возвращает:
// - error: ошибка если что-то пошло не так
func (s *EmailService) SendVerificationEmail(email string) error {
	// Генерируем случайный хеш для верификации
	hash := s.generateRandomHash()

	// Создаем запись верификации
	record := dto.VerificationRecord{
		Email: email, // Email пользователя
		Hash:  hash,  // Сгенерированный хеш
	}

	// Сохраняем запись в репозитории
	s.repository.SaveRecord(record)

	// Отправляем email с ссылкой для верификации
	return s.sendEmail(email, hash)
}

// VerifyHash проверяет хеш верификации и удаляет его из хранилища
// Принимает:
// - hash: хеш для проверки
// Возвращает:
// - bool: true если хеш найден и удален, false если не найден
func (s *EmailService) VerifyHash(hash string) bool {
	// Проверяем хеш в репозитории и удаляем если найден
	return s.repository.FindAndRemoveRecord(hash)
}

// sendEmail отправляет email через SMTP сервер
// Принимает:
// - email: адрес получателя
// - hash: хеш для верификации
// Возвращает:
// - error: ошибка если что-то пошло не так
func (s *EmailService) sendEmail(email, hash string) error {
	// Получаем конфигурацию SMTP из общего конфига
	cfg := s.config.SendEmail

	// Создаем аутентификацию для SMTP
	auth := smtp.PlainAuth(
		"Verify",         // identity (обычно пустое или название)
		cfg.SmtpUsername, // username (email отправителя)
		cfg.SmtpPassword, // пароль от почты
		cfg.SmtpHost,     // SMTP хост
	)

	// Формируем ссылку для верификации
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

// generateRandomHash генерирует случайный хеш для верификации
// Возвращает:
// - string: случайный 32-символьный хеш в hex формате
func (s *EmailService) generateRandomHash() string {
	b := make([]byte, 16)       // Создаем буфер на 16 байт
	rand.Read(b)                // Заполняем случайными байтами (криптографически безопасно)
	return fmt.Sprintf("%x", b) // Преобразуем в hex строку (32 символа)
}
