# Complete Feature & Role Inventory - Laravel to GO Mapping
**Generated**: April 12, 2026  
**Purpose**: Comprehensive audit of ALL Laravel features & roles to ensure GO captures everything

---

## Executive Summary

### Scope
- **Total Modules**: 18 major feature groups
- **Total Entities**: 40 models/database tables
- **Total Permissions**: 90+ distinct permissions
- **Total Roles**: 2 primary roles (super-admin, cashier) + 1 admin role
- **API Endpoints**: 150+ routes across web/dashboard
- **Integration Points**: WhatsApp webhooks, sync system, GO backend bridges

### Key Finding
Laravel uses **Spatie/Permission** for RBAC (90+ permissions with role→permission assignments). GO should simplify to **5 roles** with permission groups.

---

## FEATURE MODULES (18 Groups)

### 1. **AUTHENTICATION & USER MANAGEMENT**
| Feature | Status | Components | GO Priority |
|---------|--------|-----------|-------------|
| User Registration | ✅ Active | auth.php routes | Phase 1 |
| User Login | ✅ Active | AuthenticatedSessionController | Phase 1 |
| Password Reset | ✅ Active | PasswordResetLinkController, NewPasswordController | Phase 1 |
| Password Update | ✅ Active | PasswordController::update | Phase 1 |
| Email Verification | ✅ Active | VerifyEmailController | Phase 2 |
| Session Management | ✅ Active | Session invalidation, regeneration | Phase 1 |
| Logout | ✅ Active | AuthenticatedSessionController::destroy | Phase 1 |
| User Profile Management | ✅ Active | ProfileController | Phase 2 |
| User Permissions/Roles | ✅ Active | Spatie/Permission | Phase 1 |

**Database Tables**: `users`, `password_reset_tokens`, `sessions`, `roles`, `permissions`, `model_has_roles`, `model_has_permissions`

**Permissions**: `users-access`, `users-create`, `users-update`, `users-delete`, `roles-access`, `roles-create`, `roles-update`, `roles-delete`, `permissions-access`, `permissions-create`, `permissions-update`, `permissions-delete`, `dashboard-access`

---

### 2. **CUSTOMERS MODULE**
| Feature | Status | Components | GO Priority |
|---------|--------|-----------|-------------|
| List Customers | ✅ Active | CustomerController::index, routes/web.php:76 | MVP |
| Create Customer | ✅ Active | CustomerController::store (AJAX support) | MVP |
| Edit Customer | ✅ Active | CustomerController::update | MVP |
| Delete Customer | ✅ Active | CustomerController::destroy | MVP |
| Customer Search (AJAX) | ✅ Active | CustomerController::search | MVP |
| Store via AJAX (inline) | ✅ Active | CustomerController::storeAjax | MVP |

**Database Table**: `customers`  
**Fields**: id, name, email, phone, address, city_district, postal_code, notes, created_at, updated_at

**Permissions**:
- `customers-access` (view)
- `customers-create` (add new)
- `customers-edit` (modify)
- `customers-delete` (remove)

---

### 3. **VEHICLES MODULE**
| Feature | Status | Components | GO Priority |
|---------|--------|-----------|-------------|
| List Vehicles | ✅ Active | VehicleController::index (GO bridge) | MVP |
| Create Vehicle | ✅ Active | VehicleController::store | MVP |
| Edit Vehicle | ✅ Active | VehicleController::update | MVP |
| Delete Vehicle | ✅ Active | VehicleController::destroy | MVP |
| View Service History | ✅ Active | VehicleController::getServiceHistory | Phase 2 |
| View Maintenance Insights | ✅ Active | VehicleController::maintenanceInsights | Phase 2 |
| Vehicle Recommendations | ✅ Active | RecommendationController::getVehicleRecommendations | Phase 2 |
| Maintenance Schedule | ✅ Active | RecommendationController::getMaintenanceSchedule | Phase 2 |
| Get with History | ✅ Active | VehicleController::getWithHistory | Phase 2 |

**Database Table**: `vehicles`  
**Fields**: id, customer_id, brand, model, year, plate_number, transmission_type, engine, color, vin, last_service_date, next_service_date, notes, created_at, updated_at

**Permissions**:
- `vehicles-access`
- `vehicles-create`
- `vehicles-edit`
- `vehicles-delete`

---

### 4. **MECHANICS MODULE**
| Feature | Status | Components | GO Priority |
|---------|--------|-----------|-------------|
| List Mechanics | ✅ Active | MechanicController::index (GO bridge) | MVP |
| Create Mechanic | ✅ Active | MechanicController::store | MVP |
| Edit Mechanic | ✅ Active | MechanicController::update | MVP |
| Delete Mechanic | ✅ Active | MechanicController::destroy | MVP |
| Performance Dashboard | ✅ Active | MechanicPerformanceController::dashboard | Phase 2 |
| Mechanic Performance Report | ✅ Active | MechanicPerformanceController::show | Phase 2 |
| Export Mechanic Performance | ✅ Active | MechanicPerformanceController::export | Phase 2 |

**Database Table**: `mechanics`  
**Fields**: id, name, phone, employee_number, notes, hourly_rate, commission_percentage, status, created_at, updated_at

**Permissions**:
- `mechanics-access`
- `mechanics-create`
- `mechanics-update`
- `mechanics-delete`

---

### 5. **SERVICE CATEGORIES MODULE**
| Feature | Status | Components | GO Priority |
|---------|--------|-----------|-------------|
| List Service Categories | ✅ Active | ServiceCategoryController::index | Phase 1 |
| Create Service Category | ✅ Active | ServiceCategoryController::store | Phase 1 |
| Edit Service Category | ✅ Active | ServiceCategoryController::update | Phase 1 |
| Delete Service Category | ✅ Active | ServiceCategoryController::destroy | Phase 1 |

**Database Table**: `service_categories`  
**Fields**: id, name, description, created_at, updated_at

**Permissions**:
- `service-categories-access`
- `service-categories-create`
- `service-categories-edit`
- `service-categories-delete`

---

### 6. **SERVICES MODULE**
| Feature | Status | Components | GO Priority |
|---------|--------|-----------|-------------|
| List Services | ✅ Active | ServiceController::index | MVP |
| Create Service | ✅ Active | ServiceController::store | MVP |
| Edit Service | ✅ Active | ServiceController::update | MVP |
| Delete Service | ✅ Active | ServiceController::destroy | MVP |
| Bulk Status Update | ✅ Active | ServiceController::bulkStatus | MVP |
| Bulk Delete | ✅ Active | ServiceController::bulkDelete | MVP |
| Service Price Adjustments | ✅ Active | ServicePriceAdjustment model | MVP |
| Mechanic Incentives | ✅ Active | ServiceMechanicIncentive model | MVP |
| Warranty Management | ✅ Active | has_warranty, warranty_duration_days fields | MVP |

**Database Tables**: `services`, `service_price_adjustments`, `service_mechanic_incentives`  
**Service Fields**: id, service_category_id, code, title, description, price, est_time_minutes, complexity_level (simple|medium|complex), required_tools, status, has_warranty, warranty_duration_days, warranty_terms, incentive_mode (same|by_mechanic), default_incentive_percentage, created_at, updated_at

**Permissions**:
- `services-access`
- `services-create`
- `services-edit`
- `services-delete`

---

### 7. **SERVICE ORDERS MODULE** ⭐ Core MVP
| Feature | Status | Components | GO Priority |
|---------|--------|-----------|-------------|
| List Service Orders | ✅ Active | ServiceOrderController::index (GO bridge) | MVP |
| Create Service Order | ✅ Active | ServiceOrderController::store | MVP |
| Quick Intake (Express Order) | ✅ Active | ServiceOrderController::storeQuick | MVP |
| Edit Service Order | ✅ Active | ServiceOrderController::update | MVP |
| View Service Order | ✅ Active | ServiceOrderController::show | MVP |
| Update Status | ✅ Active | ServiceOrderController::updateStatus | MVP |
| Print Order | ✅ Active | ServiceOrderController::print | MVP |
| Delete Order | ✅ Active | ServiceOrderController::destroy | MVP |
| Claim Warranty | ✅ Active | ServiceOrderController::claimWarranty | MVP |
| Status History | ✅ Active | ServiceOrderStatusHistory model | MVP |

**Database Tables**: `service_orders`, `service_order_details`, `service_order_status_history`

**Service Order Fields**:
- id, order_number, customer_id, vehicle_id, mechanic_id, status (pending|in_progress|completed|paid|cancelled|draft|confirmed|waiting_stock|ready_to_notify|waiting_pickup)
- labor_cost, material_cost, total, grand_total, discount_type, discount_value, tax_type, tax_value
- notes, warranty_claimed, created_at, updated_at

**Permissions**:
- `service-orders-access`
- `service-orders-create`
- `service-orders-update`
- `service-orders-delete`

---

### 8. **APPOINTMENTS MODULE**
| Feature | Status | Components | GO Priority |
|---------|--------|-----------|-------------|
| List Appointments | ✅ Active | AppointmentController::index | MVP |
| Calendar View | ✅ Active | AppointmentController::calendar | Phase 2 |
| Create Appointment | ✅ Active | AppointmentController::store | MVP |
| Edit Appointment | ✅ Active | AppointmentController::update | MVP |
| Update Status | ✅ Active | AppointmentController::updateStatus | MVP |
| Delete Appointment | ✅ Active | AppointmentController::destroy | MVP |
| Get Available Slots | ✅ Active | AppointmentController::getAvailableSlots | MVP |
| Export to ICS | ✅ Active | AppointmentController::exportIcs | Phase 2 |

**Database Table**: `appointments`  
**Fields**: id, customer_id, vehicle_id, mechanic_id, appointment_date, appointment_time, duration_minutes, status (scheduled|completed|cancelled|no-show|rescheduled), notes, created_at, updated_at

**Permissions**:
- `appointments-access`
- `appointments-create`
- `appointments-update`
- `appointments-delete`

---

### 9. **PARTS MODULE**
| Feature | Status | Components | GO Priority |
|---------|--------|-----------|-------------|
| List Parts | ✅ Active | PartController::index | MVP |
| Create Part | ✅ Active | PartController::store | MVP |
| Edit Part | ✅ Active | PartController::update | MVP |
| Delete Part | ✅ Active | PartController::destroy | MVP |
| View Part Details | ✅ Active | PartController::show | MVP |
| Low Stock Alerts | ✅ Active | LowStockAlertController::index | MVP |
| Warranty Info | ✅ Active | has_warranty, warranty_duration_days fields | MVP |

**Database Table**: `parts`  
**Fields**: id, name, part_number, barcode, part_category_id, supplier_id, buy_price, sell_price, stock, minimal_stock, rack_location, description, has_warranty, warranty_duration_days, warranty_terms, status, created_at, updated_at

**Permissions**:
- `parts-access`
- `parts-create`
- `parts-update`
- `parts-delete`

---

### 10. **PART CATEGORIES MODULE**
| Feature | Status | Components | GO Priority |
|---------|--------|-----------|-------------|
| List Part Categories | ✅ Active | PartCategoryController::index | Phase 1 |
| Create Part Category | ✅ Active | PartCategoryController::store + storeAjax | Phase 1 |
| Edit Part Category | ✅ Active | PartCategoryController::update | Phase 1 |
| Delete Part Category | ✅ Active | PartCategoryController::destroy | Phase 1 |

**Database Table**: `part_categories`  
**Fields**: id, name, description, created_at, updated_at

**Permissions**:
- `part-categories-access`
- `part-categories-create`
- `part-categories-edit`
- `part-categories-delete`

---

### 11. **SUPPLIERS MODULE**
| Feature | Status | Components | GO Priority |
|---------|--------|-----------|-------------|
| List Suppliers | ✅ Active | SupplierController::index (GO bridge) | MVP |
| Create Supplier | ✅ Active | SupplierController::store + storeAjax | MVP |
| Edit Supplier | ✅ Active | SupplierController::update | MVP |
| Delete Supplier | ✅ Active | SupplierController::destroy | MVP |

**Database Table**: `suppliers`  
**Fields**: id, name, phone, email, address, contact_person, notes, status, created_at, updated_at

**Permissions**:
- `suppliers-access`
- `suppliers-create`
- `suppliers-update`
- `suppliers-delete`

---

### 12. **PART PURCHASES MODULE** 
| Feature | Status | Components | GO Priority |
|---------|--------|-----------|-------------|
| List Part Purchases | ✅ Active | PartPurchaseController::index (GO bridge) | Phase 1 |
| Create Part Purchase | ✅ Active | PartPurchaseController::store | Phase 1 |
| Edit Part Purchase | ✅ Active | PartPurchaseController::update | Phase 1 |
| View Part Purchase | ✅ Active | PartPurchaseController::show | Phase 1 |
| Update Status | ✅ Active | PartPurchaseController::updateStatus | Phase 1 |
| Print Purchase | ✅ Active | PartPurchaseController::print | Phase 1 |

**Database Tables**: `part_purchases`, `part_purchase_details`  
**Statuses**: pending|received|partial|cancelled|completed

**Permissions**:
- `part-purchases-access`
- `part-purchases-create`
- `part-purchases-update`
- `part-purchases-delete`

---

### 13. **PART SALES MODULE** ⭐ Core MVP
| Feature | Status | Components | GO Priority |
|---------|--------|-----------|-------------|
| List Part Sales | ✅ Active | PartSaleController::index | MVP |
| Create Part Sale | ✅ Active | PartSaleController::store | MVP |
| Edit Part Sale | ✅ Active | PartSaleController::update | MVP |
| View Part Sale | ✅ Active | PartSaleController::show | MVP |
| Delete Part Sale | ✅ Active | PartSaleController::destroy | MVP |
| Print Invoice | ✅ Active | PartSaleController::print | MVP |
| Update Payment Status | ✅ Active | PartSaleController::updatePayment | MVP |
| Update Order Status | ✅ Active | PartSaleController::updateStatus | MVP |
| Claim Warranty | ✅ Active | PartSaleController::claimWarranty | MVP |
| View Warranties | ✅ Active | PartSaleController::warranties | MVP |
| Export Warranties | ✅ Active | PartSaleController::exportWarranties | Phase 2 |
| Create from Order | ✅ Active | PartSaleController::createFromOrder | Phase 2 |

**Database Tables**: `part_sales`, `part_sale_details`, `warranty_registrations`

**Permissions**:
- `part-sales-access`
- `part-sales-create`
- `part-sales-show`
- `part-sales-edit`
- `part-sales-delete`
- `part-sales-warranty-claim`

---

### 14. **PART STOCK MANAGEMENT MODULE**
| Feature | Status | Components | GO Priority |
|---------|--------|-----------|-------------|
| Stock Movement History | ✅ Active | PartStockHistoryController::index | MVP |
| Stock In | ✅ Active | PartStockController::storeIn | MVP |
| Stock Out | ✅ Active | PartStockController::storeOut | MVP |
| Export Stock Movements | ✅ Active | PartStockHistoryController::export | Phase 2 |

**Database Table**: `part_stock_movements`  
**Fields**: id, part_id, type (in|out), qty, before_stock, after_stock, unit_price, supplier_id, notes, created_by, created_at

**Permissions**:
- `part-stock-history-access`
- `parts-stock-access`
- `parts-stock-in`
- `parts-stock-out`

---

### 15. **VOUCHERS MODULE**
| Feature | Status | Components | GO Priority |
|---------|--------|-----------|-------------|
| List Vouchers | ✅ Active | VoucherController::index | Phase 1 |
| Create Voucher | ✅ Active | VoucherController::store | Phase 1 |
| Edit Voucher | ✅ Active | VoucherController::update | Phase 1 |
| Delete Voucher | ✅ Active | VoucherController::destroy | Phase 1 |
| Eligibility Rules | ✅ Active | VoucherEligibility model | Phase 1 |
| Voucher Usage Tracking | ✅ Active | VoucherUsage model | Phase 1 |

**Database Tables**: `vouchers`, `voucher_eligibilities`, `voucher_usages`

**Permissions**:
- `vouchers-access`
- `vouchers-create`
- `vouchers-edit`
- `vouchers-delete`

---

### 16. **REPORTING & ANALYTICS MODULE** ⭐ Core MVP
| Feature | Status | Components | GO Priority |
|---------|--------|-----------|-------------|
| Overall Report | ✅ Active | ServiceReportController::overall (GO bridge) | MVP |
| Service Revenue Report | ✅ Active | ServiceReportController::revenue | MVP |
| Mechanic Productivity Report | ✅ Active | ServiceReportController::mechanicProductivity | MVP |
| Mechanic Payroll Report | ✅ Active | ServiceReportController::mechanicPayroll | MVP |
| Parts Inventory Report | ✅ Active | ServiceReportController::partsInventory | MVP |
| Outstanding Payments Report | ✅ Active | ServiceReportController::outstandingPayments | MVP |
| Part Sales Profit Report | ✅ Active | PartSalesProfitReportController::index | MVP |
| Part Sales Profit by Supplier | ✅ Active | PartSalesProfitReportController::bySupplier | MVP |
| Export Reports (CSV) | ✅ Active | ServiceReportController::exportCsv | MVP |

**Database Tables**: `service_orders`, `part_sales`, `mechanics`, `parts`, `cash_transactions`

**Permissions**:
- `reports-access`

---

### 17. **CASH MANAGEMENT & ACCOUNTING MODULE**
| Feature | Status | Components | GO Priority |
|---------|--------|-----------|-------------|
| Cash Drawer View | ✅ Active | CashManagementController::index | MVP |
| Update Cash Stock | ✅ Active | CashManagementController::updateStock | MVP |
| Record Transaction | ✅ Active | CashManagementController::storeTransaction | MVP |
| Suggest Change | ✅ Active | CashManagementController::suggestChange | MVP |
| Settle Sale Cash | ✅ Active | CashManagementController::settleSaleCash | MVP |

**Database Tables**: `cash_denominations`, `cash_drawer_denominations`, `cash_transactions`, `cash_transaction_items`

**Fields**:
- `cash_denominations`: id, value, is_active, created_at, updated_at
- `cash_transactions`: id, transaction_type (income|expense|change_given|adjustment), amount, source, description, happened_at, created_by, meta, created_at, updated_at
- `cash_transaction_items`: id, transaction_id, denomination_id, direction (in|out), quantity, line_total

**Permissions**:
- `cash-management-access`
- `cash-management-manage`

---

### 18. **BUSINESS SETTINGS & CONFIGURATION**
| Feature | Status | Components | GO Priority |
|---------|--------|-----------|-------------|
| Business Profile | ✅ Active | BusinessProfileController | MVP |
| Payment Settings | ✅ Active | PaymentSettingController | MVP |
| Data Import | ✅ Active | DataImportController | Phase 2 |

**Database Tables**: `business_profiles`, `payment_settings`

**Business Profile Fields**: id, business_name, business_phone, business_address, facebook, instagram, tiktok, google_my_business, website, receipt_note_transaction, receipt_note_service_order, receipt_note_part_sale, receipt_note_part_purchase

**Permissions**:
- `payment-settings-access`

---

### 19. **SYSTEM INTEGRATIONS**
| Feature | Status | Components | GO Priority |
|---------|--------|-----------|-------------|
| WhatsApp Webhooks | ✅ Active | WhatsAppWebhookController | Phase 2 |
| WhatsApp Outbound Logging | ✅ Active | WhatsAppLogController::index | Phase 2 |
| WhatsApp Health Check | ✅ Active | WhatsAppLogController::healthCheck | Phase 2 |
| WhatsApp Retry | ✅ Active | WhatsAppLogController::retry | Phase 2 |
| WhatsApp Go Dashboard | ✅ Active | WhatsAppGoController | Phase 2 |
| Data Sync System | ✅ Active | SyncController | Phase 2 |

**Database Tables**: `whatsapp_outbound_messages`, `whatsapp_webhook_events`, `sync_batches`, `sync_received_batches`, `sync_outbox_items`

**Permissions**:
- `reports-access` (for WhatsApp logs)

---

### 20. **NOTIFICATIONS MODULE**
| Feature | Status | Components | GO Priority |
|---------|--------|-----------|-------------|
| Notification Center | ✅ Active | NotificationController::index | Phase 2 |
| Mark as Read | ✅ Active | NotificationController::markRead | Phase 2 |
| Mark All as Read | ✅ Active | NotificationController::markAllRead | Phase 2 |
| Delete Notification | ✅ Active | NotificationController::destroy | Phase 2 |
| Low Stock Alerts | ✅ Active | LowStockAlert model | Phase 2 |

**Database Tables**: `notifications`, `low_stock_alerts`

---

## ROLES & PERMISSIONS MATRIX

### Laravel Roles (From Seeders)

#### 1. **super-admin** (Spatie/Permission Model)
- **Definition**: Full system access, can perform ALL operations
- **Permissions**: ALL 90+ permissions
- **Seeder**: RoleSeeder::run() → `$superRole->givePermissionTo(Permission::all())`
- **Status**: Operational

**Permissions Granted**:
```
dashboard-access, users-access, users-create, users-update, users-delete,
roles-access, roles-create, roles-update, roles-delete,
permissions-access, permissions-create, permissions-update, permissions-delete,
customers-access, customers-create, customers-edit, customers-delete,
reports-access, payment-settings-access,
vehicles-access, vehicles-create, vehicles-edit, vehicles-delete,
service-categories-access, service-categories-create, service-categories-edit, service-categories-delete,
part-categories-access, part-categories-create, part-categories-edit, part-categories-delete,
services-access, services-create, services-edit, services-delete,
vouchers-access, vouchers-create, vouchers-edit, vouchers-delete,
service-orders-access, service-orders-create, service-orders-update, service-orders-delete,
appointments-access, appointments-create, appointments-update, appointments-delete,
mechanics-access, mechanics-create, mechanics-update, mechanics-delete,
suppliers-access, suppliers-create, suppliers-update, suppliers-delete,
parts-access, parts-create, parts-update, parts-delete,
part-purchases-access, part-purchases-create, part-purchases-update, part-purchases-delete,
part-sales-access, part-sales-create, part-sales-show, part-sales-edit, part-sales-delete,
part-sales-orders-access, part-sales-orders-create, part-sales-orders-update, part-sales-orders-delete,
part-purchase-orders-access, part-purchase-orders-create, part-purchase-orders-update, part-purchase-orders-delete,
part-stock-history-access, parts-stock-access, parts-stock-in, parts-stock-out,
cash-management-access, cash-management-manage,
tags-access, tags-create, tags-update, tags-delete,
vehicle-recommendations-access, maintenance-schedule-access,
part-sales-warranty-claim
```

#### 2. **cashier** (Spatie/Permission Model)
- **Definition**: Limited to point-of-sale operations
- **Status**: Operational
- **Use Cases**: Counter staff handling direct sales and cash transactions

**Permissions Granted** (from RoleSeeder):
```
dashboard-access,
customers-access, customers-create,
service-orders-access, service-orders-create, service-orders-update,
part-sales-access, part-sales-create, part-sales-show, part-sales-edit,
cash-management-access, cash-management-manage
```

#### 3. **admin** (Spatie/Permission Model)
- **Definition**: Administrative access, workshop management
- **Status**: Created via AssignWorkshopPermissionsToAdminSeeder
- **Use Cases**: Workshop managers, supervisors

**Permissions Granted** (from AssignWorkshopPermissionsToAdminSeeder):
```
service-categories-access, service-categories-create, service-categories-edit, service-categories-delete,
part-categories-access, part-categories-create, part-categories-edit, part-categories-delete,
services-access, services-create, services-edit, services-delete,
service-orders-access, service-orders-create, service-orders-update, service-orders-delete,
appointments-access, appointments-create, appointments-update, appointments-delete,
mechanics-access, mechanics-create, mechanics-update, mechanics-delete,
suppliers-access, suppliers-create, suppliers-update, suppliers-delete,
parts-access, parts-create, parts-update, parts-delete,
parts-stock-access, parts-stock-in, parts-stock-out
```

### Proposed GO Roles (Simplified from Spatie)

| Role | Laravel Equivalent | GO Permissions | MVP Support | Notes |
|------|-------------------|-----------------|-----------|-------|
| **admin** | super-admin | ALL | ✅ | Full system access |
| **supervisor** | admin | Dashboard, orders, mechanics, reports | ✅ | Workshop supervision |
| **mechanic** | Partial cashier | Service orders (own), vehicles, parts (view), appointments | ✅ | Service execution |
| **staff** | cashier | Part sales, cash, customers, appointments | ✅ | Counter/sales |
| **customer** | Custom | View own vehicles, appointments, orders | Phase 2 | Customer portal |

---

## ALL DATABASE ENTITIES (40 Models)

| # | Entity | Table | Purpose | MVP | Notes |
|----|--------|-------|---------|-----|-------|
| 1 | User | users | Authentication & user data | ✅ | Enhanced by auth tables |
| 2 | Role | roles | Role definitions (Spatie) | ✅ | 3 roles: super-admin, cashier, admin |
| 3 | Permission | permissions | Permission definitions (Spatie) | ✅ | 90+ permissions |
| 4 | Customer | customers | Customer information | ✅ | Core entity |
| 5 | Vehicle | vehicles | Vehicle data with service history | ✅ | Core entity |
| 6 | Mechanic | mechanics | Mechanic profiles & performance | ✅ | Core entity |
| 7 | ServiceCategory | service_categories | Service type grouping | ✅ | Core entity |
| 8 | Service | services | Service definitions with pricing | ✅ | Core entity |
| 9 | ServiceOrder | service_orders | Workshop orders | ✅ | Core MVP entity |
| 10 | ServiceOrderDetail | service_order_details | Line items for orders | ✅ | Core MVP entity |
| 11 | ServiceOrderStatusHistory | service_order_status_history | Audit trail | ✅ | For realtime updates |
| 12 | Appointment | appointments | Service appointment scheduling | ✅ | Core MVP entity |
| 13 | Supplier | suppliers | Part supplier data | ✅ | Core entity |
| 14 | Part | parts | Inventory parts | ✅ | Core entity |
| 15 | PartCategory | part_categories | Part type grouping | ✅ | Core entity |
| 16 | PartPurchase | part_purchases | Part purchase orders | ✅ | Procurement |
| 17 | PartPurchaseDetail | part_purchase_details | Line items for purchases | ✅ | Procurement |
| 18 | PartPurchaseOrder | part_purchase_orders | Legacy PO system | ⚠️ | DISABLED (legacy) |
| 19 | PartPurchaseOrderDetail | part_purchase_order_details | Legacy PO line items | ⚠️ | DISABLED (legacy) |
| 20 | PartSale | part_sales | Direct part sales | ✅ | Core MVP entity |
| 21 | PartSaleDetail | part_sale_details | Line items for part sales | ✅ | Core MVP entity |
| 22 | PartSalesOrder | part_sales_orders | Part sales orders (legacy) | ⚠️ | Mostly disabled |
| 23 | PartSalesOrderDetail | part_sales_order_details | Legacy sales order items | ⚠️ | Mostly disabled |
| 24 | PartStockMovement | part_stock_movements | Stock transaction audit trail | ✅ | Core entity |
| 25 | ServiceMechanicIncentive | service_mechanic_incentives | Mechanic commission structure | ✅ | For mechanic payroll |
| 26 | ServicePriceAdjustment | service_price_adjustments | Dynamic pricing rules | ✅ | For service pricing |
| 27 | Voucher | vouchers | Discount vouchers | ⚠️ | Phase 1 (partially used) |
| 28 | VoucherEligibility | voucher_eligibilities | Voucher usage rules | ⚠️ | Phase 1 |
| 29 | VoucherUsage | voucher_usages | Voucher redemption tracking | ⚠️ | Phase 1 |
| 30 | WarrantyRegistration | warranty_registrations | Product warranty tracking | ✅ | Core entity |
| 31 | CashDenomination | cash_denominations | Currency denomination definitions | ✅ | For cash drawer |
| 32 | CashDrawerDenomination | cash_drawer_denominations | Current cash stock | ✅ | For cash drawer |
| 33 | CashTransaction | cash_transactions | Cash in/out transactions | ✅ | Core MVP entity |
| 34 | CashTransactionItem | cash_transaction_items | Cash transaction line items | ✅ | Core MVP entity |
| 35 | BusinessProfile | business_profiles | Workshop business info | ✅ | Configuration |
| 36 | PaymentSetting | payment_settings | Payment method configuration | ⚠️ | Phase 2 (partial use) |
| 37 | LowStockAlert | low_stock_alerts | Stock alert notifications | ✅ | Phase 2 |
| 38 | Tag | tags | Resource tagging system | ⚠️ | Phase 2 |
| 39 | WhatsAppOutboundMessage | whatsapp_outbound_messages | WhatsApp message queue | ⚠️ | Phase 2 |
| 40 | WhatsAppWebhookEvent | whatsapp_webhook_events | WhatsApp webhook logs | ⚠️ | Phase 2 |
| 41 | SyncBatch | sync_batches | Data sync tracker | ⚠️ | Phase 2 |
| 42 | SyncReceivedBatch | sync_received_batches | Received sync batches | ⚠️ | Phase 2 |
| 43 | SyncOutboxItem | sync_outbox_items | Outgoing sync items | ⚠️ | Phase 2 |

---

## COMPLETE PERMISSIONS LIST (93 Total)

### Core System Permissions (13)
```
1. dashboard-access           # View dashboard
2. users-access              # List users
3. users-create              # Create new user
4. users-update              # Update user
5. users-delete              # Delete user
6. roles-access              # List roles
7. roles-create              # Create role
8. roles-update              # Update role
9. roles-delete              # Delete role
10. permissions-access       # List permissions
11. permissions-create       # Create permission
12. permissions-update       # Update permission
13. permissions-delete       # Delete permission
```

### Customer Management (4)
```
14. customers-access         # View customers
15. customers-create         # Create customer
16. customers-edit           # Update customer
17. customers-delete         # Delete customer
```

### Reporting & Configuration (2)
```
18. reports-access           # View all reports
19. payment-settings-access  # Manage payment settings
```

### Vehicle Management (4)
```
20. vehicles-access          # View vehicles
21. vehicles-create          # Create vehicle
22. vehicles-edit            # Update vehicle
23. vehicles-delete          # Delete vehicle
```

### Service Categories (4)
```
24. service-categories-access
25. service-categories-create
26. service-categories-edit
27. service-categories-delete
```

### Part Categories (4)
```
28. part-categories-access
29. part-categories-create
30. part-categories-edit
31. part-categories-delete
```

### Services (4)
```
32. services-access
33. services-create
34. services-edit
35. services-delete
```

### Vouchers (4)
```
36. vouchers-access
37. vouchers-create
38. vouchers-edit
39. vouchers-delete
```

### Service Orders (4)
```
40. service-orders-access
41. service-orders-create
42. service-orders-update
43. service-orders-delete
```

### Appointments (4)
```
44. appointments-access
45. appointments-create
46. appointments-update
47. appointments-delete
```

### Mechanics (4)
```
48. mechanics-access
49. mechanics-create
50. mechanics-update
51. mechanics-delete
```

### Parts Management (4)
```
52. parts-access
53. parts-create
54. parts-update
55. parts-delete
```

### Part Purchases (4)
```
56. part-purchases-access
57. part-purchases-create
58. part-purchases-update
59. part-purchases-delete
```

### Part Sales (6)
```
60. part-sales-access
61. part-sales-create
62. part-sales-show
63. part-sales-edit
64. part-sales-delete
65. part-sales-warranty-claim
```

### Part Sales Orders (4) [LEGACY]
```
66. part-sales-orders-access
67. part-sales-orders-create
68. part-sales-orders-update
69. part-sales-orders-delete
```

### Part Purchase Orders (4) [LEGACY]
```
70. part-purchase-orders-access
71. part-purchase-orders-create
72. part-purchase-orders-update
73. part-purchase-orders-delete
```

### Part Stock Management (4)
```
74. part-stock-history-access
75. parts-stock-access
76. parts-stock-in
77. parts-stock-out
```

### Suppliers (4)
```
78. suppliers-access
79. suppliers-create
80. suppliers-update
81. suppliers-delete
```

### Cash Management (2)
```
82. cash-management-access
83. cash-management-manage
```

### Tags & Recommendations (5)
```
84. tags-access
85. tags-create
86. tags-update
87. tags-delete
88. vehicle-recommendations-access
89. maintenance-schedule-access
```

---

## ROUTE ANALYSIS SUMMARY

### Total Routes: 150+
- **Dashboard Routes**: 1
- **Authentication Routes**: 10 (login, register, password reset, etc.)
- **Users CRUD**: 4 (index, create, update, delete)
- **Roles CRUD**: 3 (index, update, delete - no create/edit forms)
- **Permissions CRUD**: 1 (index only)
- **Customers CRUD**: 4 + AJAX (1 search + 1 store inline)
- **Vehicles CRUD**: 4 + 4 advanced (index, create, edit, delete, with-history, service-history, recommendations, maintenance-schedule)
- **Service Categories CRUD**: 4
- **Part Categories CRUD**: 4 + AJAX store
- **Services CRUD**: 4 + bulk operations (bulk-status, bulk-delete)
- **Vouchers CRUD**: 3 (no show)
- **Service Orders**: 8+ (index, create, createQuick, show, edit, store, print, status update, claim-warranty, delete)
- **Appointments**: 8+ (index, calendar, create, edit, update, status, slots, export-ics, delete)
- **Mechanics**: 9+ (index, create, edit, delete, performance-dashboard, show, performance-show, export, create form)
- **Suppliers**: 9+ (index, create, create form, edit form, store, update, delete, storeAjax)
- **Parts**: 8+ (index, create, edit, show, delete, store, low-stock)
- **Part Purchases**: 8+ (index, create, show, print, edit, store, update, status-update)
- **Part Sales**: 13+ (index, create, show, print, edit, delete, warranties, export-warranties, update-payment, update-status, claim-warranty, create-from-order, update)
- **Part Sales Stock**: 6+ (index, create-in, store-in, create-out, store-out, export)
- **Reports**: 8 (overall, revenue, mechanic-productivity, mechanic-payroll, parts-inventory, outstanding-payments, export, plus PartSalesProfit)
- **Cash Management**: 5 (index, update-stock, store-transaction, suggest-change, settle-sales)
- **Settings**: 4 (payments edit/update, business-profile edit/update)
- **Data Import**: 3 (index, store, template)
- **Sync**: 1 (index)
- **WebHooks**: 2 (WhatsApp webhook, WhatsApp logs retry)
- **WhatsApp**: 3 (WhatsApp Go dashboard, WhatsApp logs index, health-check)
- **Notifications**: 4 (index, mark-read, read-all, delete)
- **Profile**: 3 (edit, update, delete)

---

## GO IMPLEMENTATION PRIORITY MAPPING

### 🔴 **PHASE 1: MVP Core (High Priority)**
These features MUST be in GO for MVP launch:

| Feature | Reason | Effort | Timeline |
|---------|--------|--------|----------|
| Authentication | Users cannot access system | 10h | Week 1 |
| Dashboard | Landing page | 4h | Week 1 |
| Customers | Core entity | 6h | Week 1 |
| Vehicles | Core entity | 6h | Week 1 |
| Service Orders | 🌟 Main workflow | 16h | Week 2 |
| Appointments | 🌟 Main workflow | 8h | Week 2 |
| Mechanics | Required for SO | 6h | Week 1 |
| Services | Required for SO | 8h | Week 1 |
| Service Categories | Setup data | 2h | Week 0 |
| Part Sales | 🌟 Revenue stream | 12h | Week 2 |
| Parts | Required for PS | 8h | Week 1 |
| Suppliers | Required for parts | 6h | Week 1 |
| Part Purchases | Required for parts | 8h | Week 1 |
| Stock Management | Critical for business logic | 6h | Week 1 |
| Cash Management | 🌟 Cash drawer | 8h | Week 2 |
| Reports (top 3) | Overall, Revenue, Inventory | 12h | Week 2 |
| Business Profile | Configuration | 2h | Week 0 |

### 🟡 **PHASE 2: Extended MVP (Medium Priority)**
Complete MVP features and add complementary functionality:

| Feature | Reason | Effort | Timeline |
|---------|--------|--------|----------|
| Warranties | Coverage tracking | 6h | Week 3 |
| Vouchers | Discount system | 6h | Week 3 |
| Mechanic Performance | Reporting & payroll | 8h | Week 3 |
| Advanced Reports | Outstanding payments, payroll | 8h | Week 3 |
| Low Stock Alerts | Order replenishment | 4h | Week 3 |
| Email Verification | Auth security | 2h | Week 1 |
| Maintenance Schedule | Vehicle insights | 6h | Week 3 |
| Vehicle Recommendations | Vehicle insights | 6h | Week 3 |
| Attendance/Audit | Governance | 6h | Week 3 |

### 🟢 **PHASE 3: Future (Low Priority)**
Advanced features for long-term roadmap:

| Feature | Reason | Effort | Timeline |
|---------|--------|--------|----------|
| WhatsApp Integration | Customer communication | 12h | Month 2 |
| Data Sync System | Multi-location support | 16h | Month 2 |
| Inventory Tags | Advanced categorization | 4h | Month 3 |
| Payment Gateway Integration | Online payments | 8h | Month 3 |
| Customer Portal | B2C feature | 20h | Month 4 |
| Role Permission UI | Custom RBAC management | 10h | Month 3 |
| Bulk Import/Export | Data management | 8h | Month 2 |

---

## CRITICAL GAPS TO ADDRESS IN GO

### Must-Have Features in GO
1. ✅ **Authentication** - JWT-based with 5 roles
2. ✅ **Dashboard** - KPI overview (revenue, orders, alerts)
3. ✅ **Real-time Updates** - Echo/Reverb WebSocket for status changes
4. ✅ **Service Orders** - Full CRUD with status workflow
5. ✅ **Part Sales** - Full CRUD with warranty
6. ✅ **Cash Management** - Drawer management with balance
7. ✅ **Reports** - At least 5 core reports

### Should Have
- Appointment scheduling with slot availability
- Stock movement tracking with FIFO costing
- Warranty registration & claim tracking
- Simple voucher system
- Mechanic performance analytics

### Nice to Have
- Maintenance schedule recommendations
- Low stock alerts with auto-ordering
- WhatsApp multi-device integration
- Tax & discount calculations
- Data import/export functionality

---

## SUMMARY TABLE: Features Worth Migrating

| Feature | Laravel Routes | Tables | Permissions | Complexity | Worth GO | Status |
|---------|---|-------|------------|-----------|----------|--------|
| Auth | 10 | 3 | 13 | Medium | ✅ Yes | 🔴 Phase 1 |
| Customers | 2 | 1 | 4 | Low | ✅ Yes | 🔴 Phase 1 |
| Vehicles | 7 | 1 | 4 | Low | ✅ Yes | 🔴 Phase 1 |
| Mechanics | 9 | 1 | 4 | Low | ✅ Yes | 🔴 Phase 1 |
| Services | 6 | 3 | 4 | Medium | ✅ Yes | 🔴 Phase 1 |
| Service Orders | 9 | 3 | 4 | High | ✅ CRITICAL | 🔴 Phase 1 |
| Appointments | 8 | 1 | 4 | Medium | ✅ Yes | 🔴 Phase 1 |
| Parts | 7 | 1 | 4 | Low | ✅ Yes | 🔴 Phase 1 |
| Suppliers | 9 | 1 | 4 | Low | ✅ Yes | 🔴 Phase 1 |
| Part Purchases | 8 | 2 | 4 | Medium | ✅ Yes | 🔴 Phase 1 |
| Part Sales | 13 | 2 | 6 | High | ✅ CRITICAL | 🔴 Phase 1 |
| Stock Management | 6 | 1 | 4 | Low | ✅ Yes | 🔴 Phase 1 |
| Cash Management | 5 | 4 | 2 | Medium | ✅ Yes | 🔴 Phase 1 |
| Reports | 11 | 5 | 1 | High | ✅ CRITICAL | 🔴 Phase 1 |
| Vouchers | 3 | 3 | 4 | Low | ⚠️ Maybe | 🟡 Phase 2 |
| Warranties | 2 | 1 | 1 | Low | ✅ Yes | 🟡 Phase 2 |
| Part Categories | 4 | 1 | 4 | Low | ✅ Yes | 🔴 Phase 1 |
| Service Categories | 4 | 1 | 4 | Low | ✅ Yes | 🔴 Phase 1 |
| WhatsApp | 8 | 2 | 1 | High | ❌ No | 🟢 Phase 3 |
| Sync System | 2 | 3 | 0 | High | ❌ No | 🟢 Phase 3 |
| Tags | 0 | 1 | 5 | Low | ❌ No | 🟢 Phase 3 |

---

## FINAL CHECKLIST FOR GO IMPLEMENTATION

### ✅ Database: Complete this first
- [ ] Create 32+ tables (from 001_init_sqlite.sql)
- [ ] Include 5 auth tables (users, user_roles, login_audits, password_reset_tokens, api_credentials)
- [ ] Include 15+ FK relationships
- [ ] Include 50+ indexes

### ✅ Backend APIs: Phase 1 Endpoints
- [ ] Auth endpoints (login, logout, refresh, me, change-password)
- [ ] Dashboard KPI stats
- [ ] CRUD for: customers, vehicles, mechanics, services, suppliers, parts
- [ ] Service Orders (complex business logic)
- [ ] Part Sales (complex business logic + warranty)
- [ ] Appointments (slot availability + status)
- [ ] Stock management (in/out movements)
- [ ] Cash drawer (denominations, transactions)
- [ ] Top 5 reports (revenue, productivity, inventory, outstanding, profit)

### ✅ Frontend: Phase 1 Pages
- [ ] Login page
- [ ] Dashboard
- [ ] CRUD pages for all entities
- [ ] Service Order detail view with workflow
- [ ] Part Sale form with warranty
- [ ] Report viewers
- [ ] Settings pages

### ✅ Authentication
- [ ] JWT token-based auth
- [ ] 5 roles: admin, supervisor, mechanic, staff, customer
- [ ] Permission-based route guards
- [ ] Session management

### ✅ Real-time
- [ ] WebSocket for Service Order status changes
- [ ] WebSocket for Appointment updates
- [ ] WebSocket for Stock warnings

### ✅ Business Logic
- [ ] Discount & tax calculations (DiscountTaxService)
- [ ] Warranty claim processing
- [ ] FIFO stock costing
- [ ] Mechanic incentive calculation
- [ ] Cash change suggestions

---

## CONCLUSION

### What to Migrate
**90% of Laravel features should be migrated to GO**, focusing on:
- Core workshop operations (service orders, part sales, appointments)
- Financial tracking (cash management, reporting, invoicing)
- Inventory management (part stock, suppliers, warehousing)
- User & role management with simplified RBAC
- All Master Data (customers, vehicles, mechanics, services, parts)

### What to Simplify
- **Roles**: Reduce from 90+ permissions to 5 role-based permission groups
- **Vouchers**: Phase 2 (not critical for MVP)
- **WhatsApp**: Phase 3 (integrate later)
- **Sync**: Phase 3 (multi-location sync deferred)

### What To Keep as-is
- Legacy Part Sales Orders & Part Purchase Orders (mark as deprecated)
- Tags system (Phase 3)
- Payment settings (partial Phase 2)

---

**Generated by**: Comprehensive Laravel Audit  
**Valid for**: GO Backend Development (v1.0 - MVP)
