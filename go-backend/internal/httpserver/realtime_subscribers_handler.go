package httpserver

import (
	"net/http"

	"posbengkel/go-backend/internal/config"
)

func realtimeSubscribersHandler(cfg config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if eventHub == nil {
			writeJSON(w, http.StatusServiceUnavailable, response{"message": "realtime hub is not initialized"})
			return
		}

		writeJSON(w, http.StatusOK, response{
			"service":       cfg.AppName,
			"total_clients": eventHub.ClientCount(),
			"domains":       eventHub.DomainSubscriberCounts(),
			"secured":       cfg.WebSocketToken != "",
		})
	}
}
