package httpserver

import (
	"posbengkel/go-backend/internal/events"
	"posbengkel/go-backend/internal/websocket"
)

// Global event hub - initialized in New()
var eventHub *websocket.Hub

// GetEventHub returns the global event hub
func GetEventHub() *websocket.Hub {
	return eventHub
}

// EmitEvent broadcasts an event to all subscribed clients
func EmitEvent(event *events.Event) {
	if eventHub != nil {
		eventHub.Broadcast(event)
	}
}
