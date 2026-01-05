<?php

use App\Http\Controllers\Apps\CategoryController;
use App\Http\Controllers\Apps\CustomerController;
use App\Http\Controllers\Apps\PaymentSettingController;
use App\Http\Controllers\Apps\ProductController;
use App\Http\Controllers\Apps\TransactionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Reports\ProfitReportController;
use App\Http\Controllers\Reports\SalesReportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});

Route::group(['prefix' => 'dashboard', 'middleware' => ['auth']], function () {
    Route::get('/', [DashboardController::class, 'index'])->middleware(['auth', 'verified', 'permission:dashboard-access'])->name('dashboard');
    Route::get('/permissions', [PermissionController::class, 'index'])->middleware('permission:permissions-access')->name('permissions.index');
    // roles route
    Route::resource('/roles', RoleController::class)
        ->except(['create', 'edit', 'show'])
        ->middlewareFor('index', 'permission:roles-access')
        ->middlewareFor('store', 'permission:roles-create')
        ->middlewareFor('update', 'permission:roles-update')
        ->middlewareFor('destroy', 'permission:roles-delete');
    // users route
    Route::resource('/users', UserController::class)
        ->except('show')
        ->middlewareFor('index', 'permission:users-access')
        ->middlewareFor(['create', 'store'], 'permission:users-create')
        ->middlewareFor(['edit', 'update'], 'permission:users-update')
        ->middlewareFor('destroy', 'permission:users-delete');

    Route::resource('categories', CategoryController::class)
        ->middlewareFor(['index', 'show'], 'permission:categories-access')
        ->middlewareFor(['create', 'store'], 'permission:categories-create')
        ->middlewareFor(['edit', 'update'], 'permission:categories-edit')
        ->middlewareFor('destroy', 'permission:categories-delete');
    Route::resource('products', ProductController::class)
        ->middlewareFor(['index', 'show'], 'permission:products-access')
        ->middlewareFor(['create', 'store'], 'permission:products-create')
        ->middlewareFor(['edit', 'update'], 'permission:products-edit')
        ->middlewareFor('destroy', 'permission:products-delete');
    Route::resource('customers', CustomerController::class)
        ->middlewareFor(['index', 'show'], 'permission:customers-access')
        ->middlewareFor(['create', 'store'], 'permission:customers-create')
        ->middlewareFor(['edit', 'update'], 'permission:customers-edit')
        ->middlewareFor('destroy', 'permission:customers-delete');
    // mechanics management
    Route::get('/mechanics', [\App\Http\Controllers\Apps\MechanicController::class, 'index'])->middleware('permission:mechanics-access')->name('mechanics.index');
    Route::post('/mechanics', [\App\Http\Controllers\Apps\MechanicController::class, 'store'])->middleware('permission:mechanics-create')->name('mechanics.store');
    Route::patch('/mechanics/{id}', [\App\Http\Controllers\Apps\MechanicController::class, 'update'])->middleware('permission:mechanics-update')->name('mechanics.update');
    Route::delete('/mechanics/{id}', [\App\Http\Controllers\Apps\MechanicController::class, 'destroy'])->middleware('permission:mechanics-delete')->name('mechanics.destroy');

    //suppliers management
    Route::get('/suppliers', [\App\Http\Controllers\Apps\SupplierController::class, 'index'])->middleware('permission:suppliers-access')->name('suppliers.index');
    Route::post('/suppliers', [\App\Http\Controllers\Apps\SupplierController::class, 'store'])->middleware('permission:suppliers-create')->name('suppliers.store');
    Route::patch('/suppliers/{id}', [\App\Http\Controllers\Apps\SupplierController::class, 'update'])->middleware('permission:suppliers-update')->name('suppliers.update');
    Route::delete('/suppliers/{id}', [\App\Http\Controllers\Apps\SupplierController::class, 'destroy'])->middleware('permission:suppliers-delete')->name('suppliers.destroy');

    // parts management
    Route::get('/parts', [\App\Http\Controllers\Apps\PartController::class, 'index'])->middleware('permission:parts-access')->name('parts.index');
    Route::get('/parts/create', [\App\Http\Controllers\Apps\PartController::class, 'create'])->middleware('permission:parts-create')->name('parts.create');
    Route::post('/parts', [\App\Http\Controllers\Apps\PartController::class, 'store'])->middleware('permission:parts-create')->name('parts.store');
    Route::patch('/parts/{id}', [\App\Http\Controllers\Apps\PartController::class, 'update'])->middleware('permission:parts-update')->name('parts.update');
    Route::delete('/parts/{id}', [\App\Http\Controllers\Apps\PartController::class, 'destroy'])->middleware('permission:parts-delete')->name('parts.destroy');

    // Purchases
    Route::get('/parts/purchases', [\App\Http\Controllers\Apps\PurchaseController::class, 'index'])->middleware('permission:purchases-access')->name('parts.purchases.index');
    Route::get('/parts/purchases/create', [\App\Http\Controllers\Apps\PurchaseController::class, 'create'])->middleware('permission:purchases-create')->name('parts.purchases.create');
    Route::post('/parts/purchases', [\App\Http\Controllers\Apps\PurchaseController::class, 'store'])->middleware('permission:purchases-create')->name('parts.purchases.store');

    // Sales (Sparepart)
    Route::get('/parts/sales', [\App\Http\Controllers\Apps\PartSaleController::class, 'index'])->middleware('permission:parts-sales-access')->name('parts.sales.index');
    Route::get('/parts/sales/create', [\App\Http\Controllers\Apps\PartSaleController::class, 'create'])->middleware('permission:parts-sales-create')->name('parts.sales.create');
    Route::post('/parts/sales', [\App\Http\Controllers\Apps\PartSaleController::class, 'store'])->middleware('permission:parts-sales-create')->name('parts.sales.store');

    // parts stock / movements
    Route::get('/parts/stock', [\App\Http\Controllers\Apps\PartStockController::class, 'index'])->middleware('permission:parts-stock-access')->name('parts.stock.index');
    Route::get('/parts/stock/in', [\App\Http\Controllers\Apps\PartStockController::class, 'createIn'])->middleware('permission:parts-stock-in')->name('parts.stock.in.create');
    Route::post('/parts/stock/in', [\App\Http\Controllers\Apps\PartStockController::class, 'storeIn'])->middleware('permission:parts-stock-in')->name('parts.stock.in.store');
    Route::get('/parts/stock/out', [\App\Http\Controllers\Apps\PartStockController::class, 'createOut'])->middleware('permission:parts-stock-out')->name('parts.stock.out.create');
    Route::post('/parts/stock/out', [\App\Http\Controllers\Apps\PartStockController::class, 'storeOut'])->middleware('permission:parts-stock-out')->name('parts.stock.out.store');

    // suppliers create route
    Route::get('/suppliers/create', [\App\Http\Controllers\Apps\SupplierController::class, 'create'])->middleware('permission:suppliers-create')->name('suppliers.create');

    // mechanics create route
    Route::get('/mechanics/create', [\App\Http\Controllers\Apps\MechanicController::class, 'create'])->middleware('permission:mechanics-create')->name('mechanics.create');
    //route customer history
    Route::get('/customers/{customer}/history', [CustomerController::class, 'getHistory'])->middleware('permission:transactions-access')->name('customers.history');

    //route customer store via AJAX (no redirect)
    Route::post('/customers/store-ajax', [CustomerController::class, 'storeAjax'])->middleware('permission:customers-create')->name('customers.storeAjax');

    //route transaction
    Route::get('/transactions', [TransactionController::class, 'index'])->middleware('permission:transactions-access')->name('transactions.index');

    //route transaction searchProduct
    Route::post('/transactions/searchProduct', [TransactionController::class, 'searchProduct'])->middleware('permission:transactions-access')->name('transactions.searchProduct');

    //route transaction addToCart
    Route::post('/transactions/addToCart', [TransactionController::class, 'addToCart'])->middleware('permission:transactions-access')->name('transactions.addToCart');

    //route transaction destroyCart
    Route::delete('/transactions/{cart_id}/destroyCart', [TransactionController::class, 'destroyCart'])->middleware('permission:transactions-access')->name('transactions.destroyCart');

    //route transaction updateCart
    Route::patch('/transactions/{cart_id}/updateCart', [TransactionController::class, 'updateCart'])->middleware('permission:transactions-access')->name('transactions.updateCart');

    //route hold transaction
    Route::post('/transactions/hold', [TransactionController::class, 'holdCart'])->middleware('permission:transactions-access')->name('transactions.hold');
    Route::post('/transactions/{holdId}/resume', [TransactionController::class, 'resumeCart'])->middleware('permission:transactions-access')->name('transactions.resume');
    Route::delete('/transactions/{holdId}/clearHold', [TransactionController::class, 'clearHold'])->middleware('permission:transactions-access')->name('transactions.clearHold');
    Route::get('/transactions/held', [TransactionController::class, 'getHeldCarts'])->middleware('permission:transactions-access')->name('transactions.held');

    //route transaction store
    Route::post('/transactions/store', [TransactionController::class, 'store'])->middleware('permission:transactions-access')->name('transactions.store');
    Route::get('/transactions/{invoice}/print', [TransactionController::class, 'print'])->middleware('permission:transactions-access')->name('transactions.print');
    Route::get('/transactions/history', [TransactionController::class, 'history'])->middleware('permission:transactions-access')->name('transactions.history');

    // service orders
    Route::get('/service-orders', [\App\Http\Controllers\Apps\ServiceOrderController::class, 'index'])->middleware('permission:service-orders-access')->name('service-orders.index');
    Route::get('/service-orders/{id}', [\App\Http\Controllers\Apps\ServiceOrderController::class, 'show'])->middleware('permission:service-orders-access')->name('service-orders.show');
    Route::post('/service-orders', [\App\Http\Controllers\Apps\ServiceOrderController::class, 'store'])->middleware('permission:service-orders-create')->name('service-orders.store');
    Route::post('/transactions/service-orders', [\App\Http\Controllers\Apps\ServiceOrderController::class, 'store'])->middleware('permission:transactions-access')->name('transactions.service-orders.store');
    Route::patch('/service-orders/{id}/status', [\App\Http\Controllers\Apps\ServiceOrderController::class, 'updateStatus'])->middleware('permission:service-orders-update')->name('service-orders.updateStatus');

    //appointments
    Route::get('/appointments', [\App\Http\Controllers\Apps\AppointmentController::class, 'index'])->middleware('permission:appointments-access')->name('appointments.index');
    Route::post('/appointments', [\App\Http\Controllers\Apps\AppointmentController::class, 'store'])->middleware('permission:appointments-create')->name('appointments.store');
    Route::patch('/appointments/{id}/status', [\App\Http\Controllers\Apps\AppointmentController::class, 'updateStatus'])->middleware('permission:appointments-update')->name('appointments.updateStatus');

    Route::get('/settings/payments', [PaymentSettingController::class, 'edit'])->middleware('permission:payment-settings-access')->name('settings.payments.edit');
    Route::put('/settings/payments', [PaymentSettingController::class, 'update'])->middleware('permission:payment-settings-access')->name('settings.payments.update');

    //reports
    Route::get('/reports/sales', [SalesReportController::class, 'index'])->middleware('permission:reports-access')->name('reports.sales.index');
    Route::get('/reports/profits', [ProfitReportController::class, 'index'])->middleware('permission:profits-access')->name('reports.profits.index');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
