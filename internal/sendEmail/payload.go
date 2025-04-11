package sendEmail

type EmailRequest struct {
	Email string `json:"email" validate:"required,email"`
	Hash  string `json:"hash" gorm:"uniqueIndex"`
}

type LoginResponse struct {
	Email string `json:"email" validate:"required,email"`
}
