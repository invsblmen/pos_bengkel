package httpserver

import (
	"encoding/json"
	"net/http"

	"posbengkel/go-backend/internal/events"
)

type realtimeEmitRequest struct {
	Type   string      `json:"type"`
	Domain string      `json:"domain"`
	ID     string      `json:"id"`
	Action string      `json:"action"`
	Data   interface{} `json:"data"`
}

func realtimeEmitHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req realtimeEmitRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeJSON(w, http.StatusBadRequest, response{"message": "invalid json body"})
			return
		}

		eventType := events.EventType(req.Type)
		if eventType == "" {
			eventType = events.EventHeartbeat
		}

		domain := events.Domain(req.Domain)
		if domain == "" {
			domain = events.DomainCore
		}

		e := events.NewEvent(eventType, domain)
		if req.ID != "" {
			e.WithID(req.ID)
		}
		if req.Action != "" {
			e.WithAction(req.Action)
		}
		if req.Data != nil {
			e.WithData(req.Data)
		}

		EmitEvent(e)
		writeJSON(w, http.StatusOK, response{"status": "emitted", "event": e})
	}
}
