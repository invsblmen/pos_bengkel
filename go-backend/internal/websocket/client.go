package websocket

import (
	"log"
	"time"

	"posbengkel/go-backend/internal/events"

	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512 * 1024 // 512KB
)

// Client wraps a WebSocket connection and subscription state
type Client struct {
	ID      string
	Hub     *Hub
	Conn    *websocket.Conn
	send    chan *events.Event
	Domains []events.Domain
	Done    chan struct{}
}

// NewClient creates a new WebSocket client
func NewClient(hub *Hub, conn *websocket.Conn, clientID string) *Client {
	return &Client{
		ID:      clientID,
		Hub:     hub,
		Conn:    conn,
		send:    make(chan *events.Event, 256),
		Domains: []events.Domain{},
		Done:    make(chan struct{}),
	}
}

// ReadPump reads messages from the WebSocket connection
// This should run in a goroutine
func (c *Client) ReadPump() {
	defer func() {
		c.Hub.UnregisterClient(c)
		c.Conn.Close()
		close(c.Done)
	}()

	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		var msg struct {
			Type    string   `json:"type"`
			Domains []string `json:"domains"`
		}

		err := c.Conn.ReadJSON(&msg)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("[WebSocket] Client %s error: %v", c.ID, err)
			}
			return
		}

		// Handle subscription commands
		if msg.Type == "subscribe" {
			c.handleSubscribe(msg.Domains)
		} else if msg.Type == "unsubscribe" {
			c.handleUnsubscribe(msg.Domains)
		}
	}
}

// WritePump writes messages to the WebSocket connection
// This should run in a goroutine
func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case event, ok := <-c.send:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.Conn.WriteJSON(event); err != nil {
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}

		case <-c.Done:
			return
		}
	}
}

// handleSubscribe subscribes client to domains
func (c *Client) handleSubscribe(domainNames []string) {
	domains := make([]events.Domain, 0, len(domainNames))
	for _, name := range domainNames {
		domains = append(domains, events.Domain(name))
	}

	c.Hub.Subscribe(c, domains...)
	log.Printf("[WebSocket] Client %s subscribed to: %v", c.ID, domainNames)
}

// handleUnsubscribe unsubscribes client from domains
func (c *Client) handleUnsubscribe(domainNames []string) {
	domains := make([]events.Domain, 0, len(domainNames))
	for _, name := range domainNames {
		domains = append(domains, events.Domain(name))
	}

	c.Hub.Unsubscribe(c, domains...)
	log.Printf("[WebSocket] Client %s unsubscribed from: %v", c.ID, domainNames)
}
