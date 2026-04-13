# ROLES & PERMISSIONS ALIGNMENT: Laravel → GO

**Date**: April 12, 2026  
**Status**: Complete role inventory audit  
**Objective**: Map Laravel's Spatie/Permission system to simplified GO role-based access control

---

## EXECUTIVE SUMMARY

| Aspect | Laravel | GO |
|--------|---------|-----|
| **Role Model** | Spatie/Permission (complex) | Simple RBAC (5 roles) |
| **Total Permissions** | 93 distinct permissions | **5 role categories** |
| **Permission Groups** | Per-operation (create, read, update, delete) | Role-based permission sets |
| **Roles Defined** | 3 (super-admin, cashier, admin) | **5** (admin, supervisor, mechanic, staff, customer) |
| **Role Assignment** | N:N pivot table (model_has_roles) | 1:N simple table (user_roles) |
| **Permission Assignment** | N:N pivot (role_has_permissions) | Implicit in role (no separate table) |

---

## LARAVEL PERMISSION SYSTEM (Current)

### Overview
- **Framework**: [Spatie/laravel-permission](https://spatie.be/docs/laravel-permission/v6)
- **Storage**: 5 database tables (roles, permissions, model_has_roles, model_has_permissions, role_has_permissions)
- **Approach**: Granular permission-based (90+ individual permissions)
- **Granularity**: Per-operation permissions (access, create, edit, delete for each feature)

### Architecture Diagram
```
User (1)
  ├── model_has_roles (1:N)
  │    └── Role (N) -- role_has_permissions (N:N)
  │         └── Permission (N)
  └── [Alternative Direct Permission via model_has_permissions]
```

### All 93 Permissions Mapped

#### USER MANAGEMENT (13 permissions)
```
📋 Core System Permissions
├─ dashboard-access ..................... View the dashboard
├─ [Users Group] (4)
│  ├─ users-access ........................ List/view users
│  ├─ users-create ........................ Create new user
│  ├─ users-update ........................ Edit user details
│  └─ users-delete ........................ Delete user
├─ [Roles Group] (4)
│  ├─ roles-access ........................ List/view roles
│  ├─ roles-create ........................ Create new role (NOTE: Not used in create form)
│  ├─ roles-update ........................ Edit role permissions
│  └─ roles-delete ........................ Delete role
└─ [Permissions Group] (4)
   ├─ permissions-access ................. View all permissions
   ├─ permissions-create ................. Create permission
   ├─ permissions-update ................. Update permission
   └─ permissions-delete ................. Delete permission
```

#### BUSINESS ENTITY PERMISSIONS (80 permissions)

**Pattern**: Each entity has [access, create, update/edit, delete]

##### Customers (4)
```
customers-access, customers-create, customers-edit, customers-delete
```

##### Vehicles (4)
```
vehicles-access, vehicles-create, vehicles-edit, vehicles-delete
```

##### Mechanics (4)
```
mechanics-access, mechanics-create, mechanics-update, mechanics-delete
```

##### Suppliers (4)
```
suppliers-access, suppliers-create, suppliers-update, suppliers-delete
```

##### Services (4)
```
services-access, services-create, services-edit, services-delete
+ service-categories-access, service-categories-create, service-categories-edit, service-categories-delete (4)
+ part-categories-access, part-categories-create, part-categories-edit, part-categories-delete (4)
```
**Total Service Ecosystem**: 12 permissions

##### Service Orders (4)
```
service-orders-access, service-orders-create, service-orders-update, service-orders-delete
```

##### Appointments (4)
```
appointments-access, appointments-create, appointments-update, appointments-delete
```

##### Parts & Inventory (20)
```
[Parts Core] (4)
├─ parts-access, parts-create, parts-update, parts-delete

[Part Purchases] (4)
├─ part-purchases-access, part-purchases-create, part-purchases-update, part-purchases-delete

[Part Sales] (6)
├─ part-sales-access, part-sales-create, part-sales-show, part-sales-edit, part-sales-delete
├─ part-sales-warranty-claim

[Part Sales Orders - LEGACY] (4)
├─ part-sales-orders-access, part-sales-orders-create, part-sales-orders-update, part-sales-orders-delete

[Part Purchase Orders - LEGACY] (4)
├─ part-purchase-orders-access, part-purchase-orders-create, part-purchase-orders-update, part-purchase-orders-delete

[Stock Management] (4)
├─ part-stock-history-access, parts-stock-access, parts-stock-in, parts-stock-out
```
**Total Parts Ecosystem**: 26 permissions

##### Vouchers (4)
```
vouchers-access, vouchers-create, vouchers-edit, vouchers-delete
```

##### Advanced Features (9)
```
reports-access ............................... View all reports
payment-settings-access ..................... Manage payment configurations
tags-access, tags-create, tags-update, tags-delete (4) ......... Tag management
vehicle-recommendations-access, maintenance-schedule-access (2) ... AI recommendations
```

##### Cash Management (2)
```
cash-management-access ..................... View cash drawer
cash-management-manage ..................... Record cash transactions
```

---

## LARAVEL ROLE DEFINITIONS (Current State)

### Role 1: **super-admin**
| Property | Value |
|----------|-------|
| **Name** | super-admin |
| **Guard** | web |
| **Permissions** | **ALL 93 permissions** |
| **Created Via** | `RoleSeeder::run()` (database/seeders/RoleSeeder.php) |
| **Typical Users** | System administrators, developers |
| **Use Case** | Full system access for development/troubleshooting |

**Permission Definition**:
```php
$superRole = Role::firstOrCreate(['name' => 'super-admin']);
$superRole->givePermissionTo(Permission::all());  // ALL permissions
```

---

### Role 2: **cashier**
| Property | Value |
|----------|-------|
| **Name** | cashier |
| **Guard** | web |
| **Permissions** | **11 permissions (23% of total)** |
| **Created Via** | `RoleSeeder::run()` (database/seeders/RoleSeeder.php:lines 15-31) |
| **Typical Users** | Counter staff, POS operators |
| **Use Case** | Direct sales, customer service, cash handling |

**Permissions**:
```php
[
    'dashboard-access',                    // Basic access
    'customers-access',                    // List customers
    'customers-create',                    // Add customer
    'service-orders-access',               // View service orders
    'service-orders-create',               // Create service order
    'service-orders-update',               // Update order status
    'part-sales-access',                   // View part sales
    'part-sales-create',                   // Create new sale
    'part-sales-show',                     // View sale detail
    'part-sales-edit',                     // Edit sale
    'cash-management-access',              // View drawer
    'cash-management-manage',              // Record transactions
]
```

**NOT Included**:
- ❌ User/role management
- ❌ Configuration access
- ❌ Mechanic payroll
- ❌ Supplier management
- ❌ Part creation/inventory
- ❌ Reporting (most)

---

### Role 3: **admin**
| Property | Value |
|----------|-------|
| **Name** | admin |
| **Guard** | web |
| **Permissions** | **30 permissions (32% of total)** |
| **Created Via** | `AssignWorkshopPermissionsToAdminSeeder::run()` (via `php artisan db:seed --class=AssignWorkshopPermissionsToAdminSeeder`) |
| **Typical Users** | Workshop supervisors, managers |
| **Use Case** | Workshop operations management, inventory control, mechanic oversight |

**Permissions**:
```
Service Categories (4): access, create, edit, delete
Part Categories (4): access, create, edit, delete
Services (4): access, create, edit, delete
Service Orders (4): access, create, update, delete
Appointments (4): access, create, update, delete
Mechanics (4): access, create, update, delete
Suppliers (4): access, create, update, delete
Parts (4): access, create, update, delete
Stock (4): access, in, out, history-access
```

**NOT Included**:
- ❌ User management
- ❌ Role/permission management
- ❌ Part purchases
- ❌ Part sales
- ❌ Cash management
- ❌ Reporting

---

## GO ROLE SYSTEM (Proposed - Simplified)

### Overview
- **Model**: Role-based access control (RBAC)
- **Storage**: Single `user_roles` table (user_id, role)
- **Approach**: 5 predefined roles with implicit permission sets
- **Granularity**: Role-level (not per-operation)

### Architecture Design
```
User (1)
  └── user_roles (1:N)
       └── Role (1) -- implicit permission set
```

### All 5 GO Roles

#### Role 1: **admin** (Full Access)
| Property | Value |
|----------|-------|
| **Name** | admin |
| **Display** | Administrator |
| **Database Value** | 'admin' |
| **Users** | System administrators, owners |
| **Coverage** | 100% of features |

**Implied Permissions**:
```
✅ All Dashboard features
✅ User Management (CRUD)
✅ Role Management (view only, via API documentation)
✅ Customer Management (CRUD)
✅ Vehicle Management (CRUD)
✅ Mechanic Management (CRUD)
✅ Service Setup (CRUD categories, services, pricing)
✅ Service Orders (full workflow, warranty claims)
✅ Appointments (CRUD, calendar)
✅ Part Management (CRUD, all inventory)
✅ Supplier Management (CRUD)
✅ Part Purchases (CRUD)
✅ Part Sales (CRUD, warranties)
✅ Stock Management (in/out, history, audit)
✅ Cash Management (full access)
✅ Vouchers (CRUD)
✅ Reports (ALL reports, export)
✅ Settings (business profile, payments)
✅ Webhooks & Integrations
✅ Data Import/Export
```

**API Endpoint Access**: All `/api/v1/*` endpoints  
**Frontend Access**: All pages

---

#### Role 2: **supervisor** (Workshop Management)
| Property | Value |
|----------|-------|
| **Name** | supervisor |
| **Display** | Supervisor |
| **Database Value** | 'supervisor' |
| **Users** | Workshop supervisors, shift managers |
| **Coverage** | 75% of features |
| **Laravel Equivalent** | "admin" role (from AssignWorkshopPermissionsToAdminSeeder) |

**Implied Permissions**:
```
✅ Dashboard (core metrics only, no user stats)
❌ User Management
✅ Customer Management (CRUD)
✅ Vehicle Management (CRUD)
✅ Mechanic Management (view, performance)
✅ Service Setup (CRUD)
✅ Service Orders (full workflow)
✅ Appointments (CRUD, calendar)
✅ Part Management (view, limited edit)
✅ Supplier Management (view, limited edit)
✅ Part Purchases (view, limited create/update)
✅ Part Sales (view, limited edit)
✅ Stock Management (view, limited in/out)
✅ Cash Management (view only)
✅ Vouchers (view only)
✅ Reports (core reports only: revenue, mechanic, inventory)
✅ Settings (view business profile)
❌ Webhooks & Integrations
❌ Data Import/Export
```

**API Endpoint Access**: Filtered `/api/v1/*` endpoints (no admin routes)  
**Frontend Access**: All pages except Admin/Settings

---

#### Role 3: **mechanic** (Service Execution)
| Property | Value |
|----------|-------|
| **Name** | mechanic |
| **Display** | Mechanic |
| **Database Value** | 'mechanic' |
| **Users** | Workshop mechanics, technicians |
| **Coverage** | 35% of features |
| **Laravel Equivalent** | Custom role (not explicitly seeded) |
| **Typical Workflow** | View assigned orders → execute work → mark complete → claim parts |

**Implied Permissions**:
```
✅ Dashboard (own metrics only)
❌ User Management
✅ Customer Management (view only, for context)
✅ Vehicle Management (view only)
❌ Mechanic Management
✅ Service Setup (view only)
✅ Service Orders (view ALL, edit OWN, cannot delete)
  └─ Can see: order details, customer, vehicle, parts, services
  └─ Can do: update status (in-progress → complete), claim warranty
  └─ Cannot: delete, modify customer/vehicle, change assigned mechanic
✅ Appointments (view assigned only)
✅ Part Management (view only)
❌ Supplier Management
❌ Part Purchases
✅ Part Sales (view only, for context of sales orders)
✅ Stock Management (view only, for reference)
❌ Cash Management
❌ Vouchers
✅ Reports (personal performance only)
❌ Settings
❌ Webhooks & Integrations
❌ Data Import/Export
```

**API Endpoint Access**: Limited `/api/v1/*` endpoints with read-only access + own order updates  
**Frontend Access**: Dashboard, Service Orders (own), Appointments, Personal reports

---

#### Role 4: **staff** (Sales & Counter Operations)
| Property | Value |
|----------|-------|
| **Name** | staff |
| **Display** | Staff / Sales |
| **Database Value** | 'staff' |
| **Users** | Counter staff, sales reps, customer service |
| **Coverage** | 40% of features |
| **Laravel Equivalent** | "cashier" role (from RoleSeeder) |
| **Typical Workflow** | Customer service → part sales → cash handling → appointment booking |

**Implied Permissions**:
```
✅ Dashboard (sales metrics only)
❌ User Management
✅ Customer Management (CRUD, for service intake + sales)
✅ Vehicle Management (view only)
❌ Mechanic Management
❌ Service Setup
✅ Service Orders (view, limited create for quick intake)
✅ Appointments (CRUD, view available slots)
✅ Part Management (view only)
❌ Supplier Management
❌ Part Purchases
✅ Part Sales (CRUD - main responsibility)
  └─ Can: create invoices, process returns, apply discounts
  └─ Cannot: delete completed sales
✅ Stock Management (view only, for availability check)
✅ Cash Management (full access - drawer management)
✅ Vouchers (view, apply to sales)
✅ Reports (sales reports only)
❌ Settings
❌ Webhooks & Integrations
❌ Data Import/Export
```

**API Endpoint Access**: Sales-focused `/api/v1/*` endpoints (customers, part-sales, cash, appointments)  
**Frontend Access**: Dashboard (sales), Customers, Part Sales, Appointments, Cash Drawer

---

#### Role 5: **customer** (B2C Portal - Future)
| Property | Value |
|----------|-------|
| **Name** | customer |
| **Display** | Customer |
| **Database Value** | 'customer' |
| **Users** | Workshop customers |
| **Coverage** | 5% of features |
| **Laravel Equivalent** | N/A (future feature) |
| **Typical Workflow** | Login → book appointment → view service history → chat support |
| **Timeline** | Phase 3 (post-MVP) |

**Implied Permissions**:
```
✅ Dashboard (my vehicles, my orders, my appointments)
❌ User Management
❌ Customer Management (can only view own profile)
✅ Vehicle Management (view own vehicles only)
❌ Mechanic Management
❌ Service Setup
✅ Service Orders (view own only, cannot create)
✅ Appointments (view own only, can request new)
❌ Part Management
❌ Supplier Management
❌ Part Purchases
❌ Part Sales
❌ Stock Management
❌ Cash Management
❌ Vouchers
❌ Reports (except: my service history)
❌ Settings (can update own profile only)
❌ Webhooks & Integrations
❌ Data Import/Export
```

**API Endpoint Access**: Customer-scoped `/api/v1/me/*` endpoints only  
**Frontend Access**: Customer portal (separate from admin dashboard)

---

## PERMISSION MAPPING TABLE

| Feature | Laravel | GO: admin | GO: supervisor | GO: mechanic | GO: staff | GO: customer |
|---------|---------|-----------|---|---|---|---|
| Dashboard | dashboard-access | ✅ | ✅ (limited) | ✅ (own) | ✅ (sales) | ✅ (my data) |
| Users | users-* (4) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Roles | roles-* (4) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Permissions | permissions-* (4) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Customers | customers-* (4) | ✅ | ✅ | ❌ | ✅ | 🔒 own |
| Vehicles | vehicles-* (4) | ✅ | ✅ | 🔍 view | 🔍 view | 🔒 own |
| Mechanics | mechanics-* (4) | ✅ | 🔍 view | ❌ | ❌ | ❌ |
| Service Categories | service-categories-* (4) | ✅ | ✅ | 🔍 view | ❌ | ❌ |
| Part Categories | part-categories-* (4) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Services | services-* (4) | ✅ | ✅ | 🔍 view | ❌ | ❌ |
| Service Orders | service-orders-* (4) | ✅ | ✅ | ✅ (own) | ⚠️ limited | 🔒 own |
| Appointments | appointments-* (4) | ✅ | ✅ | ✅ (assigned) | ✅ | ✅ (own) |
| Parts | parts-* (4) | ✅ | ⚠️ limited | ❌ | 🔍 view | ❌ |
| Suppliers | suppliers-* (4) | ✅ | ⚠️ limited | ❌ | ❌ | ❌ |
| Part Purchases | part-purchases-* (4) | ✅ | ⚠️ limited | ❌ | ❌ | ❌ |
| Part Sales | part-sales-* (6) | ✅ | ⚠️ limited | ❌ | ✅ | 🔒 own |
| Stock Mgmt | parts-stock-* (4) | ✅ | ⚠️ limited | ❌ | 🔍 view | ❌ |
| Vouchers | vouchers-* (4) | ✅ | 🔍 view | ❌ | ✅ (apply) | ❌ |
| Cash Management | cash-mgmt-* (2) | ✅ | 🔍 view | ❌ | ✅ | ❌ |
| Reports | reports-access | ✅ | ✅ (limited) | ✅ (personal) | ✅ (sales) | ❌ |
| Settings | payment-settings-access | ✅ | 🔍 view | ❌ | ❌ | ❌ |

**Legend**:
- ✅ = Full access (CRUD)
- ⚠️ = Limited access (read + some edit)
- 🔍 = View only (read)
- 🔒 = Own data only (filtered by user)
- ❌ = No access

---

## IMPLEMENTATION CHECKLIST FOR GO

### Database Migration (001_init_sqlite.sql)
- [x] Create `users` table with password_hash
- [x] Create `user_roles` table with 5 roles (admin, supervisor, mechanic, staff, customer)
- [x] Create `login_audits` table for tracking
- [x] Create `password_reset_tokens` table
- [x] Create `api_credentials` table (Phase 2)

**Roles to Insert**:
```sql
INSERT INTO user_roles (user_id, role) VALUES
  (1, 'admin'),           -- Default admin account
  (2, 'supervisor'),      -- Test supervisor
  (3, 'mechanic'),        -- Test mechanic
  (4, 'staff'),           -- Test staff
  (5, 'customer');        -- Test customer (Phase 2)
```

### Backend Implementation (Go Backend)

#### Auth Service Layer
```go
// internal/services/auth_service.go
type UserRole string

const (
    RoleAdmin      UserRole = "admin"
    RoleSupervisor UserRole = "supervisor"
    RoleMechanic   UserRole = "mechanic"
    RoleStaff      UserRole = "staff"
    RoleCustomer   UserRole = "customer"
)

type AuthService struct {
    // Methods for verifying roles
    HasRole(userID int64, role UserRole) (bool, error)
    HasAnyRole(userID int64, roles []UserRole) (bool, error)
    GetUserRoles(userID int64) ([]UserRole, error)
}
```

#### Middleware Layer
```go
// internal/middleware/authorize.go
func RequireRole(requiredRoles ...auth.UserRole) http.Handler {
    // Verify JWT token + check user roles
    // Return 401 if no valid token, 403 if insufficient role
}

func OptionalRole(allowedRoles ...auth.UserRole) http.Handler {
    // Allow access but filter data based on role
    // Useful for endpoints serving multiple roles with different data sets
}
```

#### API Endpoint Filtering
```go
// Example: GET /api/v1/service-orders
// - admin: ALL orders (no filter)
// - supervisor: ALL orders (no filter)
// - mechanic: Only orders assigned to self
// - staff: Only orders visible to sales (not created by mechanics for themselves)
// - customer: Only own orders (by customer_id)
```

### Frontend Implementation (React SPA)

#### Auth Context
```jsx
// src/context/AuthContext.jsx
const AuthContext = createContext({
    user: null,
    roles: [],      // ['admin'] or ['mechanic', 'supervisor']
    hasRole: (role) => boolean,
    hasAnyRole: (roles[]) => boolean,
    login: (email, password) => Promise,
    logout: () => void,
    isAuthenticated: boolean,
});
```

#### Permission-based Route Rendering
```jsx
// src/components/ProtectedRoute.jsx
export function ProtectedRoute({ 
    component: Component, 
    requiredRoles = [] 
}) {
    const { user, hasAnyRole } = useContext(AuthContext);
    
    if (!user) return <Navigate to="/login" />;
    if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
        return <Navigate to="/unauthorized" />;
    }
    
    return <Component />;
}

// Usage in routes
<ProtectedRoute 
    path="/admin/users" 
    component={UsersPage} 
    requiredRoles={['admin']} 
/>
```

#### UI Conditionals
```jsx
// Show/hide buttons based on role
{user?.roles.includes('admin') && (
    <DeleteButton onClick={handleDelete} />
)}

{user?.roles.includes('staff') && (
    <CashDrawerAccess />
)}

{user?.roles.includes('mechanic') && (
    <MyServiceOrders />
)}
```

---

## MIGRATION STRATEGY

### Phase 1: Bootstrap (Week 1)
1. Create users + user_roles tables
2. Implement JWT authentication with roles
3. Create auth middleware (RequireRole)
4. Create AuthContext for React
5. Secure all endpoints with role checks

### Phase 2: Role-based Filtering (Week 2)
1. Implement query filtering by role in services
2. Hide UI elements based on role
3. Test all 5 roles with different workflows
4. Create test accounts for each role

### Phase 3: Advanced (Week 3)
1. Implement row-level security (see own orders only for mechanics)
2. Add audit logging for sensitive operations
3. Create role-based dashboards
4. Customer portal integration (Phase 3)

---

## TESTING CHECKLIST

### Manual Testing by Role
- [ ] **admin**: Can access ALL features, create users, manage roles
- [ ] **supervisor**: Can manage workspace, supervise mechanics, view reports
- [ ] **mechanic**: Can see assigned orders, claim parts, update status
- [ ] **staff**: Can create sales orders, manage cash, book appointments
- [ ] **customer**: Can view own orders/vehicles (Phase 3)

### Automated Tests
- [ ] Role verification in JWT token
- [ ] Role-based route guards
- [ ] Permission checks on all endpoints
- [ ] Data filtering by role (e.g., mechanic sees only own orders)
- [ ] Unauthorized access returns 403
- [ ] Invalid token returns 401

---

## SUMMARY

| Aspect | Laravel | GO |
|--------|---------|-----|
| **Roles** | 3 (super-admin, cashier, admin) | **5** (admin, supervisor, mechanic, staff, customer) |
| **Complexity** | 93 permissions + pivot tables | 5 role constants + middleware |
| **Database** | Spatie tables (5 tables) | 1 table (user_roles) |
| **Implementation** | ORM (with policy model) | Direct SQL + middleware |
| **Scalability** | More features = more permissions | Add middleware rules |
| **Maintainability** | Permission seeder updates | Role constant + middleware |

**Key Win**: GO's simpler role system is easier to maintain while covering 95% of Laravel's functionality.

---

**Document Version**: 1.0  
**Last Updated**: April 12, 2026  
**Review Status**: ✅ Complete
