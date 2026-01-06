# Dokumentasi Sistem POS Bengkel Motor

## Ringkasan Proyek
Sistem Point of Sale untuk manajemen bengkel sepeda motor yang komprehensif. Sistem ini menangani:
- Pemesanan layanan perbaikan/servis
- Manajemen mekanik dan appointment
- Penjualan dan stok spare parts
- Transaksi pembayaran
- Laporan dan analytics

## Status Fitur Saat Ini

### ✅ Sudah Diimplementasikan
1. **Mekanik Management** - CRUD mekanik dasar
2. **Parts Management** - CRUD parts dengan supplier
3. **Services** - CRUD layanan servis
4. **Vehicle** - Menyimpan data kendaraan pelanggan
5. **Service Orders** - Membuat pesanan servis
6. **Service Order Details** - Detail items dalam pesanan servis
7. **Appointments** - Model untuk booking (perlu view lengkap)
8. **Part Sales** - Penjualan spare parts terpisah
9. **Parts Stock Movement** - Tracking stok parts
10. **Purchases** - Pembelian parts dari supplier
11. **Transaction/Payment** - Integrasi payment gateway
12. **Permission & Roles** - Sistem permission sudah terintegrasi

### ⚠️ Perlu Diperbaiki/Dilengkapi

#### 1. Customer Model
- [ ] Tambah field: gender, birth_date, address, city, postal_code
- [ ] Tambah field: identity_type (KTP/SIM), identity_number
- [ ] Tambah field: vehicle_count (jumlah kendaraan yang didaftar)
- [ ] Relasi: hasMany('Vehicle')
- [ ] Tambah method untuk rating/feedback

#### 2. Vehicle Model
- [ ] Pastikan sudah terintegrasi dengan Customer
- [ ] Tambah field: transmission_type, engine_type, color, features
- [ ] Tambah field: last_service_date, mileage, service_history
- [ ] Relationship lengkap ke ServiceOrder

#### 3. Service/Layanan Servis
- [ ] Tambah kategori service (tune-up, ganti oli, repair gearbox, dll)
- [ ] Tambah field: required_parts (part apa saja yang biasanya dipakai)
- [ ] Tambah complexity_level (mudah, sedang, sulit)
- [ ] Create ServiceCategory model
- [ ] Update ServiceController dengan view CRUD lengkap

#### 4. Part Management
- [ ] Tambah kategori parts (engine parts, electrical, suspension, dll)
- [ ] Tambah field: unit_measure (pcs, liter, kg)
- [ ] Tambah field: reorder_level (stok minimum)
- [ ] Create PartCategory model
- [ ] Tambah view form untuk create/edit parts dengan kategori

#### 5. Mechanic Management
- [ ] Tambah field: specialization (skill/keahlian)
- [ ] Tambah field: hourly_rate atau service_commission
- [ ] Tambah field: status (active, inactive)
- [ ] Tambah field: certification (STM, dll)
- [ ] Create MechanicSpecialization model
- [ ] Tambah dashboard mekanik dengan performance metrics

#### 6. Service Order Workflow
- [ ] Tambah field: actual_start_at, actual_finish_at
- [ ] Tambah field: labor_cost, material_cost
- [ ] Tambah status workflow: pending → in_progress → completed → paid
- [ ] Create service_order_status_history table untuk tracking status changes
- [ ] Implementasi automatic calculation labor cost berdasarkan mechanic dan hours
- [ ] Add part deduction dari inventory saat SO completed

#### 7. Appointment System
- [ ] Lengkapi AppointmentController (CRUD lengkap)
- [ ] Create view untuk appointment management
- [ ] Tambah field: appointment_time_slot
- [ ] Add reminder notification
- [ ] Integrase dengan availability mekanik

#### 8. Transaction/Payment
- [ ] Ensure transaction terintegrasi dengan ServiceOrder
- [ ] Implement payment_status (pending, completed, failed, refunded)
- [ ] Add field: payment_method (cash, debit, credit, check, etc)
- [ ] Create receipt template yang proper
- [ ] Implement Invoice generation untuk ServiceOrder

#### 9. Reports & Analytics
- [ ] Daily/Weekly/Monthly service revenue
- [ ] Mechanic productivity report (jumlah SO, total earnings)
- [ ] Parts inventory report
- [ ] Customer satisfaction/repeat customer rate
- [ ] Spare parts sales report
- [ ] Outstanding payment tracking

#### 10. View/UI Issues
- [ ] Create proper Inertia views untuk Services CRUD
- [ ] Create views untuk Mechanics yang lebih detail
- [ ] Fix Parts category in views
- [ ] Create Service Order detail view yang proper
- [ ] Create Appointment calendar view
- [ ] Create Dashboard yang menampilkan today's appointments & service orders
- [ ] Create print invoice/receipt templates

#### 11. Database Migrations
- [ ] Review dan pastikan semua field sesuai kebutuhan
- [ ] Add missing timestamps pada beberapa table
- [ ] Add soft_delete jika diperlukan untuk archive data
- [ ] Optimize indexes untuk performance

#### 12. Seeders & Factories
- [ ] Create seeder untuk Service samples
- [ ] Create seeder untuk Parts samples
- [ ] Create seeder untuk test Mechanics
- [ ] Create factories untuk testing

## Database Schema Overview

### Core Tables
- `users` - Admin/kasir/mekanik
- `customers` - Data pelanggan
- `vehicles` - Data kendaraan pelanggan
- `mechanics` - Data mekanik
- `parts` - Spare parts inventory
- `services` - Layanan servis yang ditawarkan
- `service_orders` - Pesanan servis
- `service_order_details` - Detail items dalam pesanan servis
- `appointments` - Booking kendaraan

### Transaction Tables
- `transactions` - Transaksi pembayaran
- `transaction_details` - Detail transaksi (bisa product/service/part)
- `carts` - Shopping cart

### Parts Management Tables
- `part_sales` - Penjualan spare parts
- `part_sale_details` - Detail penjualan parts
- `purchases` - Pembelian parts dari supplier
- `purchase_details` - Detail pembelian
- `part_stock_movements` - History perubahan stok

### Support Tables
- `suppliers` - Data supplier
- `categories` - Kategori products
- `payment_settings` - Payment gateway configuration
- `roles`, `permissions` - Permission system

## Fitur Prioritas

### Priority 1 (Kritis)
- ✅ Service Order workflow (create, assign mekanik, update status)
- ✅ Part inventory management (track stok)
- ✅ Transaction/Payment system
- ✅ Basic reporting

### Priority 2 (Penting)
- ⚠️ Appointment scheduling
- ⚠️ Service category & mechanic specialization
- ⚠️ Dashboard dengan KPIs
- ⚠️ Complete UI/Views

### Priority 3 (Penambah Value)
- ⚠️ Advanced reporting
- ⚠️ Customer rating/feedback
- ⚠️ SMS/Email notifications
- ⚠️ Receipt templates

## Teknologi Yang Digunakan
- **Backend**: Laravel 12.38.1
- **Frontend**: React 18 dengan Inertia.js 2.0
- **Database**: MySQL/SQLite (tergantung .env)
- **CSS**: Tailwind CSS 3
- **Permission**: Spatie Laravel Permission 6.7
- **UI Components**: Tabler Icons React

## Next Steps
1. Mulai dari Priority 1 items
2. Perbaiki/lengkapi model dan migration
3. Implement controller dan business logic
4. Buat view/UI untuk setiap fitur
5. Testing menyeluruh
6. Deploy dan monitoring
