package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"gorm.io/gorm"
)

type HealthStatus struct {
	Status    string            `json:"status"`
	Database  string            `json:"database"`
	Telegram  string            `json:"telegram"`
	Timestamp time.Time         `json:"timestamp"`
	Details   map[string]string `json:"details,omitempty"`
}

type HealthHandler struct {
	db              *gorm.DB
	telegramService interface{}
}

func NewHealthHandler(db *gorm.DB, telegramService interface{}) *HealthHandler {
	return &HealthHandler{
		db:              db,
		telegramService: telegramService,
	}
}

func (h *HealthHandler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	status := HealthStatus{
		Timestamp: time.Now(),
		Details:   make(map[string]string),
	}

	sqlDB, err := h.db.DB()
	if err != nil {
		status.Database = "disconnected"
		status.Details["db_error"] = err.Error()
	} else if err := sqlDB.Ping(); err != nil {
		status.Database = "unreachable"
		status.Details["db_error"] = err.Error()
	} else {
		status.Database = "connected"
	}

	if h.telegramService == nil {
		status.Telegram = "disconnected"
		status.Details["telegram_error"] = "service not initialized"
	} else {
		status.Telegram = "connected"
	}

	if status.Database == "connected" && status.Telegram == "connected" {
		status.Status = "healthy"
		w.WriteHeader(http.StatusOK)
	} else {
		status.Status = "unhealthy"
		w.WriteHeader(http.StatusServiceUnavailable)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(status)
}

func (h *HealthHandler) LivenessCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("alive"))
}

func (h *HealthHandler) ReadinessCheck(w http.ResponseWriter, r *http.Request) {
	sqlDB, err := h.db.DB()
	if err != nil || sqlDB.Ping() != nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		w.Write([]byte("not ready"))
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("ready"))
}
