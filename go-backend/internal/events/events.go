package events

import (
	"encoding/json"
	"time"
)

// EventType defines the type of real-time event
type EventType string

const (
	// Service Order events
	EventServiceOrderStatusChanged EventType = "service_order.status_changed"
	EventServiceOrderCreated       EventType = "service_order.created"
	EventServiceOrderUpdated       EventType = "service_order.updated"
	EventServiceOrderDeleted       EventType = "service_order.deleted"

	// Appointment events
	EventAppointmentStatusChanged EventType = "appointment.status_changed"
	EventAppointmentCreated       EventType = "appointment.created"
	EventAppointmentUpdated       EventType = "appointment.updated"
	EventAppointmentDeleted       EventType = "appointment.deleted"

	// Part Sales/Purchases events
	EventPartSaleCreated     EventType = "part_sale.created"
	EventPartSaleUpdated     EventType = "part_sale.updated"
	EventPartPurchaseCreated EventType = "part_purchase.created"
	EventPartPurchaseUpdated EventType = "part_purchase.updated"

	// Sync events
	EventSyncBatchStarted   EventType = "sync.batch_started"
	EventSyncBatchCompleted EventType = "sync.batch_completed"
	EventSyncBatchFailed    EventType = "sync.batch_failed"

	// Report events
	EventReportUpdated EventType = "report.updated"

	// Connection heartbeat
	EventHeartbeat EventType = "heartbeat"
)

// Domain groups related events
type Domain string

const (
	DomainCore         Domain = "core"
	DomainAppointment  Domain = "appointments"
	DomainServiceOrder Domain = "service_orders"
	DomainPartSales    Domain = "part_sales"
	DomainPartPurchase Domain = "part_purchases"
	DomainSync         Domain = "sync"
	DomainReports      Domain = "reports"
)

// Event represents a real-time event to broadcast
type Event struct {
	Type      EventType       `json:"type"`
	Domain    Domain          `json:"domain"`
	ID        string          `json:"id,omitempty"`     // Resource ID
	Action    string          `json:"action,omitempty"` // e.g., "status_changed", "created"
	Data      json.RawMessage `json:"data,omitempty"`   // Event-specific data
	Timestamp time.Time       `json:"timestamp"`
	Source    string          `json:"source,omitempty"` // "go" or "laravel"
}

// NewEvent creates a new event
func NewEvent(eventType EventType, domain Domain) *Event {
	return &Event{
		Type:      eventType,
		Domain:    domain,
		Timestamp: time.Now().UTC(),
		Source:    "go",
	}
}

// WithID sets the resource ID
func (e *Event) WithID(id string) *Event {
	e.ID = id
	return e
}

// WithAction sets the action
func (e *Event) WithAction(action string) *Event {
	e.Action = action
	return e
}

// WithData sets the event data (marshals interface to JSON)
func (e *Event) WithData(data interface{}) *Event {
	if b, err := json.Marshal(data); err == nil {
		e.Data = b
	}
	return e
}

// String returns JSON representation
func (e *Event) String() string {
	if b, err := json.Marshal(e); err == nil {
		return string(b)
	}
	return ""
}
