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
	"strings"
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

	loadRecords()
	router.HandleFunc("POST /send/email", handler.SendHandler())
	router.HandleFunc("GET /verify", handler.VerifyHandler())
}

func (handler *EmailHandler) SendHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := request.HandleBody[EmailRequest](&w, r)

		if err != nil {
			return
		}

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
		err = handler.sendVerificationEmail(email, hash)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to send email: %v", err), http.StatusInternalServerError)
			return
		}

		fmt.Fprintf(w, "Verification email sent to %s", email)
	}
}

func (handler *EmailHandler) VerifyHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, "/verify/")
		if path == "" {
			http.Error(w, "Hash is required", http.StatusBadRequest)
			return
		}

		parts := strings.Split(path, "/")
		hash := parts[0]

		recordsMutex.Lock()
		defer recordsMutex.Unlock()

		found := false
		index := -1

		for i, record := range records {
			if record.Hash == hash {
				found = true
				index = i
				break
			}
		}

		if found {
			// Удаляем использованный hash
			records = append(records[:index], records[index+1:]...)
			saveRecords()
			fmt.Fprint(w, "true")
		} else {
			fmt.Fprint(w, "false")
		}
	}
}

func (handler *EmailHandler) sendVerificationEmail(email, hash string) error {
	smtpHost := handler.Config.SendEmail.SmtpHost
	smtpPort := handler.Config.SendEmail.SmtpPort
	smtpUsername := handler.Config.SendEmail.SmtpUsername
	smtpPassword := handler.Config.SendEmail.SmtpPassword

	auth := smtp.PlainAuth("", smtpUsername, smtpPassword, smtpHost)
	verificationLink := fmt.Sprintf("%s/verify/%s", handler.Config.BaseURL, hash)

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

func loadRecords() {
	recordsMutex.Lock()
	defer recordsMutex.Unlock()

	file, err := os.ReadFile(storageFile)
	if err != nil {
		if os.IsNotExist(err) {
			records = []VerificationRecord{}
			return
		}
		log.Fatalf("Failed to read storage file: %v", err)
	}

	err = json.Unmarshal(file, &records)
	if err != nil {
		log.Fatalf("Failed to unmarshal records: %v", err)
	}
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

func generateRandomHash() string {
	b := make([]byte, 16)
	rand.Read(b)
	return fmt.Sprintf("%x", b)
}
