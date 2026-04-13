package httpserver

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"posbengkel/go-backend/internal/config"
)

func TestGoUIHandler_ReturnsHTML(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/go-ui", nil)
	rr := httptest.NewRecorder()

	handler := goUIHandler(config.Config{AppName: "posbengkel-go", AppHost: "127.0.0.1", AppPort: "8081"})
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}

	contentType := rr.Header().Get("Content-Type")
	if !strings.Contains(contentType, "text/html") {
		t.Fatalf("expected html content-type, got %q", contentType)
	}

	body := rr.Body.String()
	if !strings.Contains(body, "POS Bengkel GO Control Surface") {
		t.Fatalf("expected ui heading to be present")
	}

	if !strings.Contains(body, "/api/v1/sync/status") {
		t.Fatalf("expected sync quick endpoint to be present")
	}
}
