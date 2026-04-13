package websocket

import (
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gorilla/websocket"
)

func isAuthorizedRequest(r *http.Request, requiredToken string) bool {
	if strings.TrimSpace(requiredToken) == "" {
		return true
	}

	provided := strings.TrimSpace(r.URL.Query().Get("token"))
	if provided == "" {
		provided = strings.TrimSpace(r.Header.Get("X-WS-Token"))
	}

	return provided == requiredToken
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// For development, allow all origins
		// In production, validate against known hosts
		origin := r.Header.Get("Origin")
		if origin == "" {
			return true
		}

		// Allow localhost and local development domains
		return strings.Contains(origin, "localhost") ||
			strings.Contains(origin, "127.0.0.1") ||
			strings.Contains(origin, "pos-bengkel.test") ||
			strings.Contains(origin, "0.0.0.0")
	},
}

// Handler creates an HTTP handler for WebSocket connections
func Handler(hub *Hub, requiredToken string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !isAuthorizedRequest(r, requiredToken) {
			http.Error(w, "unauthorized websocket token", http.StatusUnauthorized)
			return
		}

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("[WebSocket] Upgrade error: %v", err)
			return
		}

		// Generate unique client ID
		clientID := strings.TrimPrefix(r.RemoteAddr, "127.0.0.1:")
		if clientID == r.RemoteAddr {
			// Fallback if not available
			clientID = generateClientID()
		}

		client := NewClient(hub, conn, clientID)
		hub.RegisterClient(client)

		log.Printf("[WebSocket] Client %s connected from %s", clientID, r.RemoteAddr)

		// Start goroutines for reading and writing
		go client.ReadPump()
		go client.WritePump()
	}
}

// generateClientID generates a unique client ID (in production, use proper UUID)
func generateClientID() string {
	return "client-" + strings.ReplaceAll(time.Now().Format("20060102150405.000"), ".", "-")
}
