package dto

type EmailRequest struct {
	Email string `json:"email" validate:"required,email"`
}

type VerificationRecord struct {
	Email string `json:"email" validate:"required,email"`
	Hash  string `json:"hash"`
}
