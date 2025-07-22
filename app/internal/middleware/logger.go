package middleware

import (
	"log"
	"net/http"
	"time"
)

func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		userID, _ := r.Context().Value(UserIDKey).(string)

		log.Printf("➡️  %s %s | userID: %s | from: %s", r.Method, r.URL.Path, userID, r.RemoteAddr)

		next.ServeHTTP(w, r)

		duration := time.Since(start)
		log.Printf("✅ Done %s %s in %v", r.Method, r.URL.Path, duration)
	})
}
