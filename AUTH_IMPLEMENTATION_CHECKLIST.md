# 🔐 Authentication Implementation Checklist

**Status**: Phase 1 (MVP) Tables + Config **ADDED** ✅  
**Next**: Backend + Frontend implementation

---

## ✅ **What's Been Done**

### **1. SQLite Schema Enhancement**
✅ Added 5 new auth tables:
- `users` (email, password_hash, name, phone, avatar, last_login_at)
- `user_roles` (user_id, role: admin|supervisor|mechanic|staff|customer)
- `login_audits` (audit trail for security compliance)
- `password_reset_tokens` (password reset flow)
- `api_credentials` (Phase 2: API key auth)

✅ Added 15 performance indexes for auth tables

✅ Updated `.env.sqlite.example` with comprehensive auth config:
- JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE, JWT_EXPIRATION
- CORS_ALLOWED_ORIGINS, CORS_ALLOWED_METHODS
- PASSWORD_MIN_LENGTH, PASSWORD_REQUIRE_UPPERCASE, PASSWORD_REQUIRE_NUMBERS
- RATE_LIMIT_ENABLED, RATE_LIMIT_LOGIN_ATTEMPTS
- SESSION_TIMEOUT, TOKEN_REFRESH_BEFORE_EXPIRY

---

## ❌ **Still Missing (Implementation Required)**

### **GO Backend**

#### **Config Module**
```
❌ go-backend/internal/config/config.go
   - Add JWT settings (JWTSecret, JWTIssuer, JWTAudience, JWTExpiration)
   - Add password constraints (MinLength, RequireUppercase, RequireNumbers)
   - Add rate limiting config
   - Add session timeout config
```

#### **Middleware**
```
❌ go-backend/internal/middleware/auth.go
   - JWT token extraction from Authorization header
   - Token verification + claim validation
   - Store user in request context

❌ go-backend/internal/middleware/authorize.go
   - Check user roles against endpoint requirements
   - Return 403 if insufficient permissions

❌ go-backend/internal/middleware/cors.go
   - CORS headers configuration
   - Handle preflight requests
```

#### **Models**
```
❌ go-backend/internal/models/user.go
   - User struct with all fields
   - Password hashing methods
   - Role checking methods

❌ go-backend/internal/models/login_audit.go
❌ go-backend/internal/models/api_credential.go
```

#### **Services**
```
❌ go-backend/internal/services/auth_service.go
   - Login logic (verify email + password)
   - Token generation
   - Token refresh
   - Current user retrieval

❌ go-backend/internal/services/password_service.go
   - Bcrypt hashing
   - Validation
   - Reset token generation
```

#### **HTTP Handlers**
```
❌ go-backend/internal/httpserver/auth_login.go
   POST /api/v1/auth/login
   - Body: { email, password }
   - Response: { token, user, expires_at }
   - Audit log on success/failure

❌ go-backend/internal/httpserver/auth_logout.go
   POST /api/v1/auth/logout
   - Invalidate token (soft logic)

❌ go-backend/internal/httpserver/auth_me.go
   GET /api/v1/auth/me
   - Return current user + roles
   - Requires valid JWT

❌ go-backend/internal/httpserver/auth_refresh.go
   POST /api/v1/auth/refresh
   - Body: { token }
   - Response: { new_token, expires_at }

❌ go-backend/internal/httpserver/auth_change_password.go
   POST /api/v1/auth/change-password
   - Body: { old_password, new_password }

❌ go-backend/internal/httpserver/auth_forgot_password.go
   POST /api/v1/auth/forgot-password
   - Body: { email }
   - Response: { message: "Reset link sent" }
```

#### **Dependencies**
```
❌ go.mod additions:
   - github.com/golang-jwt/jwt/v5 (JWT library)
   - golang.org/x/crypto (Password hashing)
```

---

### **GO Frontend (React)**

#### **Pages**
```
❌ go-frontend/src/pages/Login.jsx
   - Email + password input fields
   - Remember me checkbox (optional)
   - Forgot password link
   - Submit to POST /api/v1/auth/login
   - Save token to localStorage
   - Redirect to /dashboard on success

❌ go-frontend/src/pages/ForgotPassword.jsx
   - Email input
   - Submit to POST /api/v1/auth/forgot-password
   - Show success message

❌ go-frontend/src/pages/ResetPassword.jsx
   - New password + confirm password
   - Submit to PUT /api/v1/auth/reset-password
   - Token from URL query param

❌ go-frontend/src/pages/Profile.jsx
   - Display current user info
   - Change name, phone, avatar
   - Change password form
   - Logout button
```

#### **Authentication Context & Hooks**
```
❌ go-frontend/src/context/AuthContext.jsx
   - Global auth state: user, loading, error
   - useEffect to load current user on mount
   - Login, logout, refreshToken methods

❌ go-frontend/src/hooks/useAuth.js
   - Hook to access AuthContext
   - Check if user is authenticated
   - Get current user info + roles
   - Handle logout

❌ go-frontend/src/hooks/useProtectedRoute.js
   - Check authentication status
   - Redirect to /login if not authenticated
   - Check user roles for authorization
```

#### **Components**
```
❌ go-frontend/src/components/ProtectedRoute.jsx
   - Wrapper for route protection
   - Check user roles
   - Show loading state
   - Redirect to unauthorized page if 403

❌ go-frontend/src/components/Unauthorized.jsx
   - 403 error page
   - Link back to dashboard

❌ go-frontend/src/components/LoginGuard.jsx
   - Redirect to /dashboard if already logged in
   - Used for /login and /forgot-password pages

❌ go-frontend/src/components/UserMenu.jsx
   - Display user name/avatar
   - Dropdown menu: Profile, Settings, Logout
   - Show current role
```

#### **Services**
```
❌ go-frontend/src/services/authService.js
   - login(email, password) → token
   - logout() → void
   - getCurrentUser() → user
   - refreshToken() → new token
   - changePassword(oldPassword, newPassword) → void
   - forgotPassword(email) → void
   - resetPassword(token, newPassword) → void
```

#### **App.jsx Updates**
```
❌ Wrap entire app with <AuthProvider>
   - Initialize auth state on mount
   - Check localStorage for token
   - Validate token on app load

❌ Update routes with ProtectedRoute
   - /login → LoginPage (no protection)
   - /dashboard → ProtectedRoute (protected)
   - /service-orders → ProtectedRoute (protected)
   - /appointments → ProtectedRoute (protected)
   - /settings → ProtectedRoute (protected)
```

---

## 📋 **Implementation Priority**

### **CRITICAL PATH** (Must do first)

1. **JWT Config in GO Backend** (30 min)
   - File: `internal/config/config.go`
   - Add JWTSecret, JWTExpiration fields
   - Load from environment

2. **Password Hashing** (1 hour)
   - File: `internal/services/password_service.go`
   - Implement bcrypt hashing/verification

3. **Auth Middleware** (1 hour)
   - File: `internal/middleware/auth.go`
   - Extract token from header
   - Verify JWT
   - Store user in context

4. **Login Endpoint** (1 hour)
   - File: `internal/httpserver/auth_login.go`
   - Verify email + password
   - Generate JWT token
   - Log attempt

5. **Current User Endpoint** (30 min)
   - File: `internal/httpserver/auth_me.go`
   - Return authenticated user + roles

6. **Login Page (React)** (1.5 hours)
   - File: `pages/Login.jsx`
   - Form with email + password
   - Post to /api/v1/auth/login
   - Save token + redirect

7. **Auth Context + Hook (React)** (1 hour)
   - File: `context/AuthContext.jsx`
   - useAuth hook
   - Global state management

8. **Protected Routes (React)** (1 hour)
   - File: `components/ProtectedRoute.jsx`
   - Wrap protected pages
   - Redirect to /login if not authenticated

---

## 📊 **Database Schema Summary**

### **New Tables**

```sql
-- users: Account credentials + profile
|- id, email (unique), password_hash, name
|- phone, avatar, is_active, last_login_at
|- created_at, updated_at, deleted_at
|
-- user_roles: Simple RBAC
|- id, user_id, role
|- Unique constraint: (user_id, role)
|- Roles: admin, supervisor, mechanic, staff, customer
|
-- login_audits: Security compliance
|- id, user_id, email, status
|- reason, ip_address, user_agent, attempted_at
|
-- password_reset_tokens: Password reset
|- id, user_id, email, token
|- expires_at, created_at
|
-- api_credentials: API key auth (Phase 2)
|- id, user_id, api_key, api_secret
|- name, scope, last_used_at, is_active
```

### **Indexes Added**

✅ idx_users_email
✅ idx_users_is_active
✅ idx_user_roles_user_id
✅ idx_login_audits_user_id
✅ idx_login_audits_attempted_at
✅ idx_password_reset_tokens_expires_at

---

## 🔑 **Initial Test Users**

After running migration, insert test users:

```sql
-- Admin user
INSERT INTO users (email, password_hash, name, phone, is_active)
VALUES ('admin@workshop.local', '[bcrypt-hash]', 'Admin User', '+62812345678', 1);

-- Mechanic user
INSERT INTO users (email, password_hash, name, phone, is_active)
VALUES ('mechanic@workshop.local', '[bcrypt-hash]', 'Mechanic', '+62812345679', 1);

-- Assign roles
INSERT INTO user_roles (user_id, role) VALUES (1, 'admin');
INSERT INTO user_roles (user_id, role) VALUES (2, 'mechanic');
```

**Default credentials (for development)** → Update in production!
- Email: admin@workshop.local
- Password: ChangeMeInProduction123
- Role: admin

---

## 🚀 **Estimated Timeline**

| Component | Hours | Who |
|-----------|-------|-----|
| GO Backend Config | 0.5 | Backend |
| Password Service | 1 | Backend |
| Auth Middleware | 1 | Backend |
| Auth Endpoints (5x) | 3 | Backend |
| **GO Backend Subtotal** | **5.5** | |
| Auth Context (React) | 1 | Frontend |
| Login Page | 1.5 | Frontend |
| Protected Routes | 1 | Frontend |
| Route Protection | 1 | Frontend |
| **GO Frontend Subtotal** | **4.5** | |
| **TOTAL** | **10 hours** | |

---

## ✅ **Testing Checklist**

### **Backend Testing**
- [ ] POST /api/v1/auth/login with valid credentials → returns token
- [ ] POST /api/v1/auth/login with invalid credentials → 401
- [ ] GET /api/v1/auth/me with token → returns user
- [ ] GET /api/v1/auth/me without token → 401
- [ ] GET /api/v1/auth/me with expired token → 401
- [ ] POST /api/v1/auth/refresh → returns new token
- [ ] login_audits table logs both success and failed attempts
- [ ] Token expiration works (24h default)

### **Frontend Testing**
- [ ] Can login and save token
- [ ] Token included in all API requests
- [ ] Redirect to /login when token missing
- [ ] Redirect to /login when token expired
- [ ] Logout clears token
- [ ] Protected routes show loading state
- [ ] Protected routes accessible after login
- [ ] Protected routes blocked before login

### **Security Testing**
- [ ] Rate limiting on login (5 failed attempts)
- [ ] Password hashed with bcrypt
- [ ] JWT includes user_id + roles
- [ ] CORS restricts to configured origins
- [ ] Password reset token expires (1 hour?)

---

## 🎯 **Decision Checkpoints**

**Q1: Session or Stateless?**
- ✅ JWT stateless (already configured)

**Q2: Role System**
- ✅ Simple: admin, supervisor, mechanic, staff, customer

**Q3: Default Users**
- ✅ Admin + Mechanic for testing

**Q4: Multi-Location Support**
- ✅ Each workshop has own SQLite + users
- ⏳ Future: Central SSO (Phase 2)

**Q5: Email Verification**
- ⏳ Phase 2 (for now: admin creates users)

**Q6: Two-Factor Auth**
- ⏳ Phase 3

---

## 📚 **Related Files**

✅ Created:
- AUTH_CREDENTIALS_GAP_AUDIT.md (detailed audit)
- SQLITE_PHASE1_COMPLETE.md (schema overview)

Updated:
- ✅ go-backend/migrations/001_init_sqlite.sql (+5 auth tables)
- ✅ .env.sqlite.example (+JWT + security config)

To Create:
- [ ] go-backend/internal/config/config.go (expand)
- [ ] go-backend/internal/middleware/auth.go (new)
- [ ] go-backend/internal/httpserver/auth_login.go (new)
- [ ] go-frontend/src/pages/Login.jsx (new)
- [ ] go-frontend/src/context/AuthContext.jsx (new)

---

## ⚠️ **Security Reminders**

🔴 **NEVER commit to Git**:
- JWT_SECRET with real value
- passwords in .env
- API_KEYs

🔴 **ALWAYS**:
- Change default passwords before production
- Use HTTPS in production (not HTTP)
- Implement rate limiting
- Log all login attempts
- Rotate secrets periodically

---

## 🤔 **Questions?**

Ready to implement Phase 1? Should I start with:
1. GO Backend auth config + middleware?
2. Go Frontend login page?
3. Both in parallel?

**Recommendation**: Start with GO Backend (5.5 hours) → then GO Frontend (4.5 hours) for logical dependency flow.

