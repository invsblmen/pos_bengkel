package websocket

import (
	"log"
	"sync"

	"posbengkel/go-backend/internal/events"
)

// ClientSubscription represents a client subscription to a domain
type ClientSubscription struct {
	ClientID string
	Domain   events.Domain
	Events   chan *events.Event
}

// Hub manages WebSocket connections and broadcasts events
type Hub struct {
	mu         sync.RWMutex
	clients    map[string]*Client          // clientID -> Client
	domains    map[events.Domain][]*Client // domain -> list of subscribed clients
	broadcast  chan *events.Event
	register   chan *Client
	unregister chan *Client
	done       chan struct{}
	isRunning  bool
}

// NewHub creates a new event hub
func NewHub() *Hub {
	return &Hub{
		clients:    make(map[string]*Client),
		domains:    make(map[events.Domain][]*Client),
		broadcast:  make(chan *events.Event, 256),
		register:   make(chan *Client, 64),
		unregister: make(chan *Client, 64),
		done:       make(chan struct{}),
	}
}

// Start begins the hub's event loop
func (h *Hub) Start() {
	h.mu.Lock()
	h.isRunning = true
	h.mu.Unlock()

	go h.run()
}

// Stop gracefully shuts down the hub
func (h *Hub) Stop() {
	h.mu.Lock()
	defer h.mu.Unlock()

	if !h.isRunning {
		return
	}

	h.isRunning = false
	close(h.done)

	// Close all client channels
	for _, client := range h.clients {
		close(client.send)
	}
}

// run implements the main event loop
func (h *Hub) run() {
	for {
		select {
		case <-h.done:
			return

		case client := <-h.register:
			if client == nil {
				continue
			}
			h.handleRegister(client)

		case client := <-h.unregister:
			if client == nil {
				continue
			}
			h.handleUnregister(client)

		case event := <-h.broadcast:
			if event == nil {
				continue
			}
			h.handleBroadcast(event)
		}
	}
}

// handleRegister adds a client and subscribes to its domains
func (h *Hub) handleRegister(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	h.clients[client.ID] = client
	log.Printf("[WebSocket] Client %s connected, subscribing to domains: %v", client.ID, client.Domains)

	// Subscribe to each domain
	for _, domain := range client.Domains {
		h.domains[domain] = append(h.domains[domain], client)
	}
}

// handleUnregister removes a client
func (h *Hub) handleUnregister(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if _, exists := h.clients[client.ID]; !exists {
		return
	}

	delete(h.clients, client.ID)
	log.Printf("[WebSocket] Client %s disconnected", client.ID)

	// Unsubscribe from all domains
	for domain, clients := range h.domains {
		for i, c := range clients {
			if c.ID == client.ID {
				h.domains[domain] = append(clients[:i], clients[i+1:]...)
				break
			}
		}
	}
}

// handleBroadcast sends event to subscribed clients
func (h *Hub) handleBroadcast(event *events.Event) {
	h.mu.RLock()
	clients := h.domains[event.Domain]
	h.mu.RUnlock()

	for _, client := range clients {
		select {
		case client.send <- event:
		default:
			// Channel full, skip to avoid blocking
			log.Printf("[WebSocket] Send buffer full for client %s, dropping event", client.ID)
		}
	}
}

// Subscribe adds a client subscription to specified domains
func (h *Hub) Subscribe(client *Client, domains ...events.Domain) {
	h.mu.Lock()
	defer h.mu.Unlock()

	for _, domain := range domains {
		// Check if already subscribed
		found := false
		for _, d := range client.Domains {
			if d == domain {
				found = true
				break
			}
		}

		if !found {
			client.Domains = append(client.Domains, domain)
			h.domains[domain] = append(h.domains[domain], client)
			log.Printf("[WebSocket] Client %s subscribed to %s", client.ID, domain)
		}
	}
}

// Unsubscribe removes client subscription from specified domains
func (h *Hub) Unsubscribe(client *Client, domains ...events.Domain) {
	h.mu.Lock()
	defer h.mu.Unlock()

	for _, domain := range domains {
		// Remove from client domains
		for i, d := range client.Domains {
			if d == domain {
				client.Domains = append(client.Domains[:i], client.Domains[i+1:]...)
				break
			}
		}

		// Remove from domain clients
		if clients, exists := h.domains[domain]; exists {
			for i, c := range clients {
				if c.ID == client.ID {
					h.domains[domain] = append(clients[:i], clients[i+1:]...)
					break
				}
			}
		}
	}

	log.Printf("[WebSocket] Client %s unsubscribed from %v", client.ID, domains)
}

// Broadcast sends an event to all subscribed clients of that domain
func (h *Hub) Broadcast(event *events.Event) {
	if !h.isRunning {
		return
	}

	select {
	case h.broadcast <- event:
	default:
		log.Printf("[WebSocket] Broadcast channel full, dropping event: %s", event.Type)
	}
}

// RegisterClient adds a client to the hub
func (h *Hub) RegisterClient(client *Client) {
	h.register <- client
}

// UnregisterClient removes a client from the hub
func (h *Hub) UnregisterClient(client *Client) {
	h.unregister <- client
}

// ClientCount returns number of connected clients
func (h *Hub) ClientCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}

// SubscriberCountForDomain returns number of clients subscribed to a domain
func (h *Hub) SubscriberCountForDomain(domain events.Domain) int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.domains[domain])
}

// DomainSubscriberCounts returns subscriber counts per domain.
func (h *Hub) DomainSubscriberCounts() map[string]int {
	h.mu.RLock()
	defer h.mu.RUnlock()

	out := make(map[string]int, len(h.domains))
	for domain, clients := range h.domains {
		out[string(domain)] = len(clients)
	}
	return out
}
