# 🔐 Authentication & Authorization - CRITICAL GAP AUDIT

**Date**: 2026-04-12  
**Status**: ⚠️ **MAJOR GAPS FOUND** - Auth/Login/Permissions NOT fully implemented

---

## ❌ **CRITICAL ISSUES FOUND**

### **1. GO Backend - NO JWT AUTHENTICATION**

**Problem**: GO backend config.go has WebSocketToken but NO API authentication!

```go
// CURRENT: config.go (Lines 24-31)
WebSocketToken     string  ← Only for WebSocket, NOT API

// MISSING:
JWTSecret          string  ← No JWT signing key
JWTExpiration      time.Duration
JWTRefreshExpiration time.Duration
APIKey             string  ← No API key auth
```

**Impact**: 
- ❌ Any user can access any GO endpoint
- ❌ No credentials verification
- ❌ No role-based access control

---

### **2. GO Backend - NO Auth Middleware**

**Current Middleware Files**:
```
go-backend/internal/middleware/
├─ logging.go          ← Request logging only
├─ request_id.go       ← Request ID tracking
└─ request_id_test.go
```

**MISSING Auth Middleware**:
```
❌ auth.go            ← Verify JWT token from Authorization header
❌ authorize.go       ← Check permissions/roles
❌ cors.go            ← Cross-origin configuration
❌ rate_limit.go      ← Rate limiting (optional security)
❌ sanitize.go        ← Input sanitization (optional)
```

---

### **3. GO Backend - NO Users/Credentials Table in SQLite**

**SQLite Current Tables**: 27 (but NO auth tables!)

**MISSING in SQLite**:
```
❌ users           ← User accounts (id, email, password_hash, name, phone)
❌ api_credentials ← API key credentials for integration
❌ user_roles      ← User role assignments
❌ role_permissions ← Role to permission mappings
❌ login_audits    ← Login attempt tracking (compliance)
```

**Comparison with Laravel**:
```
Laravel HAS:
✅ users (id, email, password, remember_token, avatar)
✅ password_reset_tokens (password reset flow)
✅ sessions (session management)
✅ permissions (name, guard_name)
✅ roles (name, guard_name)
✅ model_has_permissions (users ↔ permissions)
✅ model_has_roles (users ↔ roles)
✅ role_has_permissions (roles ↔ permissions)

GO SQLite HAS:
❌ Nothing - needs to be added!
```

---

### **4. GO Frontend React - NO Login Page**

**Current Pages**:
```
go-frontend/src/pages/
├─ Dashboard.jsx
└─ (Stub only)
```

**MISSING Pages**:
```
❌ Login.jsx           ← Email + password login
❌ Register.jsx        ← User registration (if self-signup enabled)
❌ ForgotPassword.jsx  ← Password reset flow
❌ Profile.jsx         ← User profile / settings
❌ Unauthorized.jsx    ← 401/403 error page
```

---

### **5. GO Frontend React - NO Auth Context/Hooks**

**MISSING Auth Management**:
```
❌ AuthContext.jsx         ← Global auth state (user, token, loading)
❌ useAuth() hook          ← Access current user + logout
❌ useAuthFlash() hook     ← Display auth error messages
❌ ProtectedRoute.jsx      ← Route guard for private pages
❌ withAuth() HOC          ← Wrap components needing auth
```

---

### **6. API Endpoints - Login/Register/Logout NOT Defined**

**Current GO API**: No login endpoints!

**MISSING Endpoints**:
```
❌ POST /api/v1/auth/login         ← Verify credentials, return JWT
❌ POST /api/v1/auth/register      ← Create new user account
❌ POST /api/v1/auth/logout        ← Invalidate token
❌ POST /api/v1/auth/refresh       ← Refresh JWT token
❌ GET  /api/v1/auth/me            ← Get current user profile + permissions
❌ PUT  /api/v1/auth/profile       ← Update user profile
❌ POST /api/v1/auth/change-password ← Change password
```

---

### **7. Environment Configuration - NOT Updated**

**.env.sqlite.example** has basic config but missing:

```env
# MISSING AUTH CONFIGURATION:

# JWT Settings
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ISSUER=pos-bengkel-go
JWT_AUDIENCE=pos-bengkel-frontend
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=7d

# API Authentication
API_KEY_ENABLED=false
API_KEY_HEADER_NAME=X-API-Key

# CORS (for GO Frontend)
CORS_ALLOWED_ORIGINS=http://localhost:5174
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Authorization,Content-Type

# Session
SESSION_TIMEOUT=86400

# Password Security
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SYMBOLS=false

# Rate Limiting (brute force protection)
RATE_LIMIT_ENABLED=true
RATE_LIMIT_LOGIN_ATTEMPTS=5
RATE_LIMIT_LOGIN_WINDOW=5m
RATE_LIMIT_API_REQUESTS=100
RATE_LIMIT_API_WINDOW=1m

# OAuth/SSO (optional Phase 2)
OAUTH_GOOGLE_ENABLED=false
OAUTH_GOOGLE_CLIENT_ID=
OAUTH_GOOGLE_CLIENT_SECRET=
```

---

## 📋 **Missing Components Breakdown**

### **Database Layer**

| Component | Laravel | SQLite (GO) | Status | Priority |
|-----------|---------|------------|--------|----------|
| users | ✅ Table | ❌ MISSING | **CRITICAL** | **NOW** |
| password_reset_tokens | ✅ Table | ❌ MISSING | MEDIUM | PHASE 1 |
| sessions | ✅ Table | ❌ MISSING | MEDIUM | DEFER |
| permissions | ✅ Table | ❌ MISSING | HIGH | PHASE 1 |
| roles | ✅ Table | ❌ MISSING | HIGH | PHASE 1 |
| model_has_roles | ✅ Pivot | ❌ MISSING | HIGH | PHASE 1 |
| model_has_permissions | ✅ Pivot | ❌ MISSING | HIGH | PHASE 1 |
| role_has_permissions | ✅ Pivot | ❌ MISSING | HIGH | PHASE 1 |

### **Backend Layer (GO)**

| Component | Status | Priority |
|-----------|--------|----------|
| JWT generation/verification | ❌ MISSING | **CRITICAL** |
| Password hashing (bcrypt) | ❌ MISSING | **CRITICAL** |
| Auth middleware | ❌ MISSING | **CRITICAL** |
| Authorization middleware | ❌ MISSING | **CRITICAL** |
| Login endpoint | ❌ MISSING | **CRITICAL** |
| Logout endpoint | ❌ MISSING | CRITICAL |
| Token refresh endpoint | ❌ MISSING | CRITICAL |
| Current user endpoint | ❌ MISSING | CRITICAL |
| Change password endpoint | ❌ MISSING | HIGH |
| CORS configuration | ❌ MISSING | HIGH |

### **Frontend Layer (React)**

| Component | Status | Priority |
|-----------|--------|----------|
| Login page | ❌ MISSING | **CRITICAL** |
| Auth context | ❌ MISSING | **CRITICAL** |
| useAuth() hook | ❌ MISSING | **CRITICAL** |
| Protected routes | ❌ MISSING | **CRITICAL** |
| Logout button | ❌ MISSING | CRITICAL |
| User profile page | ❌ MISSING | HIGH |
| Unauthorized page (401/403) | ❌ MISSING | HIGH |
| Session persistence (localStorage) | ⚠️ PARTIAL | HIGH |

---

## 🔧 **Implementation Plan**

### **PHASE 1 - MVP Auth (Must Have)**

**Timeline**: 6-8 hours

#### **1.1 Add Users Table to SQLite** (30 min)
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    avatar TEXT,
    is_active INTEGER DEFAULT 1,
    last_login_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT
);

CREATE TABLE user_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'supervisor', 'mechanic', 'staff')),
    assigned_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, role),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE login_audits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    email TEXT,
    status TEXT CHECK (status IN ('success', 'failed')),
    reason TEXT,
    ip_address TEXT,
    user_agent TEXT,
    attempted_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_login_audits_user_id ON login_audits(user_id);
CREATE INDEX idx_login_audits_attempted_at ON login_audits(attempted_at);
```

#### **1.2 Add Auth Config to GO Backend** (1 hour)
- Update `internal/config/config.go` to load JWT settings
- Add password security constraints
- Add CORS configuration

#### **1.3 Create Auth Middleware** (1.5 hours)
```go
// internal/middleware/auth.go
func AuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        token := extractToken(r.Header.Get("Authorization"))
        if token == "" {
            http.Error(w, "Missing token", 401)
            return
        }
        
        claims, err := verifyToken(token, cfg.JWTSecret)
        if err != nil {
            http.Error(w, "Invalid token", 401)
            return
        }
        
        // Store user in request context
        ctx := context.WithValue(r.Context(), "user_id", claims.UserID)
        ctx = context.WithValue(ctx, "user_roles", claims.Roles)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
```

#### **1.4 Create Login API Endpoints** (2 hours)
- POST `/api/v1/auth/login` - Verify email + password, return JWT
- POST `/api/v1/auth/logout` - Invalidate token
- GET `/api/v1/auth/me` - Get current user + permissions

#### **1.5 Create GO Frontend Login Page** (1.5 hours)
```jsx
// go-frontend/src/pages/Login.jsx
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  
  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('auth_token', data.token)
      window.location.href = '/dashboard'
    } catch (err) {
      setError('Invalid credentials')
    }
  }
  
  return (
    <form onSubmit={handleLogin}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
      {error && <p>{error}</p>}
    </form>
  )
}
```

#### **1.6 Create Auth Context & Hooks** (1 hour)
```jsx
// go-frontend/src/context/AuthContext.jsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      api.get('/auth/me')
        .then(({ data }) => setUser(data))
        .catch(() => localStorage.removeItem('auth_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])
  
  return <AuthContext.Provider value={{ user, loading }} children={children} />
}

// go-frontend/src/hooks/useAuth.js
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

---

### **PHASE 2 - Role-Based Access Control** (4-5 hours)

- Create `permissions` + `roles` tables
- Implement role checking middleware
- Create permission-based component wrappers

---

### **PHASE 3 - Advanced Security** (3-4 hours)

- Password reset flow
- Rate limiting on login
- OAuth/SSO integration (optional)
- Two-factor authentication (optional)

---

## 🚨 **Security Compliance Checklist**

- [ ] Passwords hashed with bcrypt (min 10 rounds)
- [ ] JWT tokens include user_id + roles
- [ ] JWT expiration enforced (24h default)
- [ ] CORS configured to allow only frontend origin
- [ ] Rate limiting on login (5 failed attempts = 15min lockout)
- [ ] HTTPS enforced in production
- [ ] Secrets NOT in .env.example (templates only)
- [ ] Login attempts logged for audit trail
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevention (sanitized inputs)
- [ ] CSRF tokens for state-changing requests

---

## 📋 **Specific Actions Required**

### **Immediate (Today)**
1. ✅ Add `users`, `user_roles`, `login_audits` tables to SQLite migration
2. ✅ Update `config.go` with JWT settings
3. ✅ Create auth middleware template
4. ✅ Create Login.jsx page template

### **This Week**
5. Implement JWT generation/verification in GO
6. Implement password hashing (bcrypt)
7. Create login endpoint
8. Create auth context in React
9. Create ProtectedRoute component
10. Test login flow end-to-end

### **Next Week**
11. Add role/permission system
12. Add password reset flow
13. Add audit logging
14. Add rate limiting

---

## 📚 **Related Documentation Files**

Files to update/create:
- [ ] `go-backend/migrations/001_init_sqlite.sql` - Add auth tables
- [ ] `go-backend/internal/config/config.go` - Add JWT config
- [ ] `go-backend/internal/middleware/auth.go` - NEW FILE
- [ ] `go-frontend/src/pages/Login.jsx` - NEW FILE
- [ ] `go-frontend/src/context/AuthContext.jsx` - NEW FILE
- [ ] `.env.sqlite.example` - Add auth variables
- [ ] `AUTH_IMPLEMENTATION.md` - NEW FILE (detailed guide)

---

## 🎯 **Decision Points**

**Questions for user**:

1. **Session Type**: 
   - JWT tokens (stateless) ← **RECOMMENDED**
   - Server sessions (stateful)

2. **User Roles**:
   - admin, supervisor, mechanic, staff (simple) ← **START HERE**
   - Custom RBAC system (complex) ← PHASE 2

3. **Registration**:
   - Admin-only (no self-signup) ← **START HERE**
   - Self-signup with email verification ← PHASE 2

4. **Multi-Location Auth**:
   - Single user per workshop ← **START HERE**
   - Shared central user database ← PHASE 3

5. **Password Reset**:
   - Email-based ← **START HERE**
   - Security questions ← PHASE 2

---

## ⚠️ **RISK ASSESSMENT**

**Current State**:
- 🔴 **CRITICAL**: No authentication = anyone can access all data
- 🔴 **CRITICAL**: No authorization = staff can see/modify admin data
- 🔴 **CRITICAL**: No audit trail = compliance violations
- 🟠 **HIGH**: No rate limiting = brute force vulnerability

**After MVP Implementation**:
- 🟢 **LOW**: JWT-based auth with token expiration
- 🟡 **MEDIUM**: Role-based access (admin/staff distinction)
- 🟡 **MEDIUM**: Login audit trail recorded

---

## 📞 **Next Steps**

**RECOMMEND: Start with PHASE 1 immediately** (6-8 hours work)

This blocks:
- ❌ GO Frontend development (can't test without login)
- ❌ Data security (all endpoints accessible)
- ❌ Compliance (no user tracking)

**Shall I proceed with adding all Phase 1 components?**
