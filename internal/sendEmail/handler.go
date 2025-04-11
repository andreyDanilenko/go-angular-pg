package sendEmail

import (
	"admin/panel/configs"
	"admin/panel/pkg/request"
	"bytes"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"os"
	"sync"
	"text/template"
)

type EmailHandler struct {
	*configs.Config
}

type EmailHandlerDeps struct {
	*configs.Config
}

type VerificationRecord struct {
	Email string `json:"email"`
	Hash  string `json:"hash"`
}

var (
	records      []VerificationRecord
	recordsMutex sync.Mutex
	storageFile  = "storage.json"
)

func NewEmailHandler(router *http.ServeMux, deps EmailHandlerDeps) {
	handler := &EmailHandler{
		Config: deps.Config,
	}
	router.HandleFunc("POST /send/email", handler.SendHandler)
}

func (handler *EmailHandler) SendHandler(w http.ResponseWriter, r *http.Request) {

	body, err := request.HandleBody[EmailRequest](&w, r)
	fmt.Println(body.Email)

	if err != nil {
		return
	}

	fmt.Println(body)

	email := body.Email

	if email == "" {
		http.Error(w, "Email is required", http.StatusBadRequest)
		return
	}

	hash := generateRandomHash()
	record := VerificationRecord{Email: email, Hash: hash}

	// Сохраняем запись
	recordsMutex.Lock()
	records = append(records, record)
	saveRecords()
	recordsMutex.Unlock()

	// Отправляем email
	err = sendVerificationEmail(email, hash)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to send email: %v", err), http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, "Verification email sent to %s", email)
}

func generateRandomHash() string {
	b := make([]byte, 16)
	rand.Read(b)
	return fmt.Sprintf("%x", b)
}

func sendVerificationEmail(email, hash string) error {
	// Конфигурация SMTP (замените на свои реальные данные)
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"
	smtpUsername := "danilko.a.g@gmail.com"
	smtpPassword := "cezvqxmcrrycaers"

	auth := smtp.PlainAuth("", smtpUsername, smtpPassword, smtpHost)

	verificationLink := fmt.Sprintf("http://localhost:8081/verify/%s", hash)

	// Загрузка HTML шаблона
	tmpl, err := template.ParseFiles("templates/email_template.html")
	if err != nil {
		return fmt.Errorf("failed to parse template: %v", err)
	}

	// Буфер для сгенерированного HTML
	var body bytes.Buffer
	data := struct {
		VerificationLink string
	}{
		VerificationLink: verificationLink,
	}

	if err := tmpl.Execute(&body, data); err != nil {
		return fmt.Errorf("failed to execute template: %v", err)
	}

	// Формирование письма
	headers := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	subject := "Subject: Email Verification\n"
	msg := []byte(subject + headers + body.String())

	// Отправка письма
	err = smtp.SendMail(smtpHost+":"+smtpPort, auth, smtpUsername, []string{email}, msg)
	if err != nil {
		return fmt.Errorf("failed to send email: %v", err)
	}

	return nil
}

func saveRecords() {
	data, err := json.MarshalIndent(records, "", "  ")
	if err != nil {
		log.Printf("Failed to marshal records: %v", err)
		return
	}

	err = os.WriteFile(storageFile, data, 0644)
	if err != nil {
		log.Printf("Failed to write storage file: %v", err)
	}
}
