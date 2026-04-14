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
  const socket = new WebSocket(wsUrl)

  socket.onopen = () => {
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
  }

  return () => {
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
