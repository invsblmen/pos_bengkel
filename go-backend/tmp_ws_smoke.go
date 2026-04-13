package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

func main() {
	c, resp, err := websocket.DefaultDialer.Dial("ws://127.0.0.1:8081/ws", nil)
	if err != nil {
		if resp != nil {
			fmt.Println("HANDSHAKE_STATUS", resp.StatusCode)
		}
		panic(err)
	}
	defer c.Close()

	_ = c.WriteJSON(map[string]any{
		"type":    "subscribe",
		"domains": []string{"service_orders"},
	})

	body := map[string]any{
		"type":   "service_order.updated",
		"domain": "service_orders",
		"id":     "go-smoke-1",
		"action": "updated",
		"data": map[string]any{
			"changed_qty_part_ids": []int{515},
		},
	}
	b, _ := json.Marshal(body)

	emitResp, err := http.Post("http://127.0.0.1:8081/api/v1/realtime/emit", "application/json", bytes.NewReader(b))
	if err != nil {
		panic(err)
	}
	rb, _ := io.ReadAll(emitResp.Body)
	_ = emitResp.Body.Close()
	fmt.Println("EMIT_STATUS", emitResp.StatusCode)
	fmt.Println(string(rb))

	_ = c.SetReadDeadline(time.Now().Add(5 * time.Second))
	_, msg, err := c.ReadMessage()
	if err != nil {
		panic(err)
	}

	fmt.Println("WS_MSG", string(msg))
}
