# GO Frontend - React SPA (Local-First)

Aplikasi React standalone untuk GO backend, dioptimalkan untuk operasi lokal/offline dengan database SQLite.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    POS Bengkel Dual-Stack                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Laravel Path (Cloud/Online)     │    GO Path (Local/Offline)│
│  ─────────────────────────────   │    ─────────────────────  │
│  Inertia React + Laravel SPA      │    React Standalone SPA   │
│  Frontend: resources/js/          │    Frontend: go-frontend/ │
│  Database: MariaDB (shared)       │    Database: SQLite (local)
│  Business logic: PHP/Laravel      │    Business logic: Go     │
│  UI: Inertia components           │    UI: React + Tailwind   │
│                                   │                           │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Development

```bash
# 1. Install dependencies
npm install

# 2. Create .env from example
cp .env.example .env

# 3. Start development server (Vite + React HMR)
npm run dev

# Frontend akan tersedia di: http://localhost:5174
# Backend GO harus running di: http://localhost:8081
```

### Production Build

```bash
npm run build
npm run preview  # Test production build locally
```

## Project Structure

```
go-frontend/
├── src/
│   ├── components/          # Reusable React components
│   │   └── Layout/          # Layout components (sidebar, header, etc)
│   ├── pages/               # Page components (full-page views)
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API services (axios client)
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles (Tailwind)
│
├── public/                  # Static assets
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── package.json
└── .env.example
```

## Key Features

- ✅ **React 18** with Vite (fast HMR)
- ✅ **React Router v6** for client-side navigation
- ✅ **Tailwind CSS** for styling
- ✅ **Axios** with interceptors for API calls
- ✅ **Zustand** for state management (ready if needed)
- ✅ **Development proxy** to GO backend (http://localhost:8081)

## API Integration

### Environment Variables

Set in `.env` or via Vite:

```
VITE_API_URL=http://localhost:8081/api/v1
VITE_WS_URL=ws://localhost:8081/ws
```

### Making API Calls

```javascript
import api from '@services/api'

// GET
const response = await api.get('/appointments')

// POST
const result = await api.post('/service-orders', {
  customer_id: 1,
  mechanic_id: 2,
})

// Error handling
try {
  await api.patch('/service-orders/1', { status: 'completed' })
} catch (error) {
  console.error('API Error:', error.response?.data)
}
```

## Realtime Updates (WebSocket)

TODO: Setup WebSocket connection for realtime sync with GO backend.

Expected endpoints:
- `ws://localhost:8081/ws` - WebSocket for realtime events
- Frame: `{ type: 'subscribe', domains: ['service_orders', 'appointments'] }`

## Development Notes

- **Vite dev server** proxies `/api/*` to `http://localhost:8081` (see vite.config.js)
- **Hot Module Reload (HMR)** enabled - save file, see changes instantly
- **Tailwind CSS** included with JIT compilation
- **No build step during development** - Vite handles it on-the-fly

## Building for Production

```bash
npm run build
```

Output: `dist/` folder ready for deployment (static files).

### Optional: Serve with Express/Node

```javascript
import express from 'express'
import path from 'path'

const app = express()
app.use(express.static(path.join(__dirname, 'dist')))
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'))
})
app.listen(5174)
```

## Debugging

- **Browser DevTools**: React Developer Tools extension recommended
- **Network tab**: Monitor API calls to GO backend
- **Console**: Check for errors/warnings
- **Vite logs**: Check terminal for build/proxy issues

## Performance Optimization (Future)

- [ ] Code splitting with React.lazy()
- [ ] Image optimization
- [ ] Service Worker for offline capability
- [ ] IndexedDB for local data persistence
- [ ] Request caching strategies

## Related

- **GO Backend**: [go-backend/README.md](../go-backend/README.md)
- **Laravel Path**: [resources/js/](../resources/js/) (Inertia React)
- **Parity Matrix**: [FRONTEND_PARITY_MATRIX.md](../FRONTEND_PARITY_MATRIX.md)
