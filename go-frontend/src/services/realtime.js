function normalizeWsUrl(rawUrl, token) {
  const source = (rawUrl || 'ws://localhost:8081/ws').trim()
  let url = source

  if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
    if (url.startsWith('/')) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      url = `${protocol}//${window.location.host}${url}`
    } else {
      url = `ws://${url}`
    }
  }

  if (!token) {
    return url
  }

  const hasQuery = url.includes('?')
  return `${url}${hasQuery ? '&' : '?'}token=${encodeURIComponent(token)}`
}

export function connectRealtime({
  domains = [],
  onEvent,
  onOpen,
  onClose,
  onError,
}) {
  if (typeof window === 'undefined' || typeof WebSocket === 'undefined') {
    return () => {}
  }

  const wsUrl = normalizeWsUrl(import.meta.env.VITE_WS_URL, import.meta.env.VITE_WS_TOKEN)
  const RECONNECT_BASE_MS = 1000
  const RECONNECT_MAX_MS = 15000

  let socket = null
  let reconnectTimer = null
  let reconnectAttempts = 0
  let shouldReconnect = true

  const clearReconnectTimer = () => {
    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  const connect = () => {
    socket = new WebSocket(wsUrl)

    socket.onopen = () => {
      reconnectAttempts = 0

      if (domains.length > 0) {
        socket.send(JSON.stringify({ type: 'subscribe', domains }))
      }
      if (typeof onOpen === 'function') {
        onOpen()
      }
    }

    socket.onmessage = (message) => {
      try {
        const payload = JSON.parse(message.data)
        if (typeof onEvent === 'function') {
          onEvent(payload)
        }
      } catch (error) {
        if (typeof onError === 'function') {
          onError(error)
        }
      }
    }

    socket.onerror = (error) => {
      if (typeof onError === 'function') {
        onError(error)
      }
    }

    socket.onclose = () => {
      if (typeof onClose === 'function') {
        onClose()
      }

      if (!shouldReconnect) {
        return
      }

      clearReconnectTimer()
      reconnectAttempts += 1
      const delay = Math.min(RECONNECT_BASE_MS * (2 ** (reconnectAttempts - 1)), RECONNECT_MAX_MS)
      reconnectTimer = window.setTimeout(() => {
        connect()
      }, delay)
    }
  }

  connect()

  return () => {
    shouldReconnect = false
    clearReconnectTimer()

    if (!socket) {
      return
    }

    if (socket.readyState === WebSocket.OPEN) {
      if (domains.length > 0) {
        socket.send(JSON.stringify({ type: 'unsubscribe', domains }))
      }
      socket.close()
      return
    }

    if (socket.readyState === WebSocket.CONNECTING) {
      socket.close()
    }
  }
}
