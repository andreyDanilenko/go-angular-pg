package email

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"html/template"
	"net/smtp"
	"strings"

	"admin/panel/internal/model"
	"admin/panel/internal/notification"
)

type Sender struct {
	host     string
	port     string
	username string
	password string
	template *template.Template
}

func NewSender(host, port, username, password, templatePath string) (*Sender, error) {
	emailTemplate, err := template.ParseFiles(templatePath)
	if err != nil {
		return nil, fmt.Errorf("parse email template: %w", err)
	}
	return &Sender{
		host:     host,
		port:     port,
		username: username,
		password: password,
		template: emailTemplate,
	}, nil
}

func (s *Sender) Handle(ctx context.Context, job model.NotificationJob) error {
	if err := ctx.Err(); err != nil {
		return err
	}
	if strings.TrimSpace(job.Recipient) == "" {
		return fmt.Errorf("email recipient is empty")
	}

	var payload notification.EmailCodePayload
	if err := json.Unmarshal([]byte(job.Payload), &payload); err != nil {
		return fmt.Errorf("decode email payload: %w", err)
	}
	if len(payload.Code) != 6 {
		return fmt.Errorf("email code must contain six characters")
	}

	var body bytes.Buffer
	if err := s.template.Execute(&body, struct{ Code string }{Code: payload.Code}); err != nil {
		return fmt.Errorf("render email template: %w", err)
	}

	message := strings.Join([]string{
		"From: " + s.username,
		"To: " + job.Recipient,
		"Subject: Код подтверждения lifedream.tech",
		"MIME-Version: 1.0",
		`Content-Type: text/html; charset="UTF-8"`,
		"",
		body.String(),
	}, "\r\n")
	auth := smtp.PlainAuth("", s.username, s.password, s.host)
	if err := smtp.SendMail(
		s.host+":"+s.port,
		auth,
		s.username,
		[]string{job.Recipient},
		[]byte(message),
	); err != nil {
		return fmt.Errorf("send email: %w", err)
	}
	return nil
}
