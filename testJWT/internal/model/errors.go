package model

import "strings"

type ConflictField struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

type ConflictError struct {
	Fields []ConflictField `json:"conflicts"`
}

func (e *ConflictError) Error() string {
	messages := make([]string, len(e.Fields))
	for i, f := range e.Fields {
		messages[i] = f.Message
	}
	return strings.Join(messages, ", ")
}
