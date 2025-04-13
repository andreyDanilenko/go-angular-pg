package dto

type EmailRequest struct {
	Email string `json:"email"`
}

type VerificationRecord struct {
	Email string `json:"email"`
	Hash  string `json:"hash"`
}
